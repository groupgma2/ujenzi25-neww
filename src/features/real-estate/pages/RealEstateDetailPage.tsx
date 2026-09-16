import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchSupabaseListingById,
  fetchSupabaseMessagesByContext,
  isSupabaseConfigured,
  sendMessageToSupabase,
} from '../../../lib/supabase';

export const RealEstateDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; time: string; from: 'user' | 'seller' }>>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!id) return;

      const fallback = {
        id,
        title: '3-Bedroom House in Dar es Salaam',
        price: 'TZS 120,000,000',
        images: ['/images/samples/house1.webp'],
        description: 'Well-located 3-bedroom house with easy access to main road.',
        location: { lat: -6.7924, lng: 39.2083 },
      };

      try {
        if (isSupabaseConfigured) {
          const property = await fetchSupabaseListingById('properties', id);
          if (property && active) {
            setData({
              id: property.id,
              title: property.title,
              price: `TZS ${Number(property.price ?? 0).toLocaleString()}`,
              images: [property.image_url || fallback.images[0]],
              description: property.description || fallback.description,
              location: { lat: Number(property.latitude ?? -6.7924), lng: Number(property.longitude ?? 39.2083) },
            });

            const savedMessages = await fetchSupabaseMessagesByContext('property', id);
            if (active) {
              setMessages((savedMessages ?? []).map((message: any) => ({
                id: String(message.id),
                text: message.content,
                time: message.created_at || new Date().toISOString(),
                from: message.sender_id === user?.id ? 'user' : 'seller',
              })));
            }
            return;
          }
        }
      } catch {
        // fall back to local sample data below
      }

      if (active) {
        setData(fallback);
        const stored = localStorage.getItem(`inbox:${id}`);
        if (stored) {
          try {
            setMessages(JSON.parse(stored));
          } catch {
            setMessages([]);
          }
        }
      }
    };

    loadData();
    return () => { active = false; };
  }, [id, user?.id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`inbox:${id}`, JSON.stringify(messages));
    }
  }, [messages, id]);

  const openDirections = () => {
    if (!data || !data.location) return;
    const dest = `${data.location.lat},${data.location.lng}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
          window.open(url, '_blank');
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
          window.open(url, '_blank');
        },
        { timeout: 8000 }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
      window.open(url, '_blank');
    }
  };

  const openSatellite = () => {
    if (!data || !data.location) return;
    const lat = data.location.lat;
    const lng = data.location.lng;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lng)}`;
    window.open(url, '_blank');
  };

  const sendMessage = async () => {
    if (!input.trim() || !id) return;
    const messageText = input.trim();
    const optimisticMessage = { id: `local-${Date.now()}`, text: messageText, time: new Date().toISOString(), from: 'user' as const };
    setMessages((current) => [...current, optimisticMessage]);
    setInput('');

    if (isSupabaseConfigured && user?.id) {
      try {
        const saved = await sendMessageToSupabase({
          sender_id: user.id,
          receiver_id: user.id,
          content: messageText,
          thread_id: `property-${id}`,
          context_type: 'property',
          context_id: id,
        });

        if (saved) {
          setMessages((current) => current.map((message) =>
            message.id === optimisticMessage.id
              ? { ...message, id: String(saved.id), time: saved.created_at || message.time }
              : message
          ));
        }
      } catch {
        // keep optimistic message if the live save fails;
      }
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen">
      <PageHero
        tone={HERO_TONES.secondary}
        eyebrow="Property Detail"
        title={data.title}
        subtitle={`${data.price} — Click below to view location or route from your position`}
        primaryCta={{ label: 'Contact Seller', to: '#' }}
        image={{ src: data.images[0], alt: data.title }}
      />

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-text-secondary mb-4">{data.description}</p>

              <div className="mb-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={openDirections} className="inline-flex items-center">Route / Directions (Google Maps)</Button>
                <Button variant="outline" onClick={openSatellite} className="inline-flex items-center">Open Satellite (Google Maps)</Button>
                <Button variant="primary" onClick={() => setChatOpen(true)} className="ml-auto">Contact / Message Seller</Button>
              </div>

              <div className="h-72 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-center text-sm text-text-secondary">Map preview — click "Route / Directions" or "Open Satellite" to open Google Maps in a new tab.</div>
              </div>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Nearby</h4>
              <p className="text-text-secondary">Schools, clinics, markets and other amenities are summarised below.</p>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>Hospital: 2.1 km</li>
                <li>School: 1.2 km</li>
                <li>Market: 900 m</li>
              </ul>
            </Card>
          </div>

          <aside>
            <Card padding="lg">
              <h4 className="font-semibold mb-2">Price</h4>
              <div className="text-2xl font-bold mb-4">{data.price}</div>
              <Button fullWidth onClick={() => setChatOpen(true)}>Request Viewing / Message Seller</Button>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-text-secondary mb-4">Use the in-site chat to message the seller. Messages are saved to Supabase when connected and remain available in local storage as a fallback.</p>
              <Button variant="outline" onClick={() => setChatOpen(true)}>Open Chat</Button>
            </Card>
          </aside>
        </div>
      </section>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-t-xl md:rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-lg font-semibold">Message Seller</div>
              <div>
                <button className="text-sm text-text-muted mr-3" onClick={() => setChatOpen(false)}>Close</button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-sm text-text-secondary">No messages yet. Start the conversation below.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.from === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}>
                      <div className="text-sm">{m.text}</div>
                      <div className="mt-1 text-xs text-white/80">{new Date(m.time).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t px-4 py-3">
              <div className="flex gap-3">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write your message..." className="input flex-1" />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
