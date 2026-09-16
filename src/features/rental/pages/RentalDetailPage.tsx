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

export const RentalDetailPage = () => {
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
        title: '2-Bedroom Apartment in Mbezi',
        rent: 'TZS 1,400,000 / month',
        images: ['/images/samples/apartment1.webp'],
        description: 'Comfortable 2-bedroom apartment close to the beach and amenities.',
        location: { lat: -6.78, lng: 39.21 },
      };

      try {
        if (isSupabaseConfigured) {
          const rental = await fetchSupabaseListingById('rentals', id);
          if (rental && active) {
            setData({
              id: rental.id,
              title: rental.title,
              rent: `TZS ${Number(rental.rent ?? 0).toLocaleString()} / month`,
              images: [rental.image_url || fallback.images[0]],
              description: rental.description || fallback.description,
              location: { lat: Number(rental.latitude ?? -6.78), lng: Number(rental.longitude ?? 39.21) },
            });

            const savedMessages = await fetchSupabaseMessagesByContext('rental', id);
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
        // local fallback
      }

      if (active) {
        setData(fallback);
        const stored = localStorage.getItem(`inbox:rental:${id}`);
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
      localStorage.setItem(`inbox:rental:${id}`, JSON.stringify(messages));
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
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location.lat + ',' + data.location.lng)}`;
    window.open(url, '_blank');
  };

  const sendMessage = async () => {
    if (!input.trim() || !id) return;
    const trimmed = input.trim();
    const optimisticMessage = { id: `local-${Date.now()}`, text: trimmed, time: new Date().toISOString(), from: 'user' as const };
    setMessages((current) => [...current, optimisticMessage]);
    setInput('');

    if (isSupabaseConfigured && user?.id) {
      try {
        const saved = await sendMessageToSupabase({
          sender_id: user.id,
          receiver_id: user.id,
          content: trimmed,
          thread_id: `rental-${id}`,
          context_type: 'rental',
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
        // keep local optimistic message if live save is unavailable.
      }
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen">
      <PageHero
        tone={HERO_TONES.green}
        eyebrow="Rental Listing"
        title={data.title}
        subtitle={data.rent}
        primaryCta={{ label: 'Message Owner', to: '#' }}
        image={{ src: data.images[0], alt: data.title }}
      />

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-text-secondary mb-4">{data.description}</p>

              <div className="mb-4 flex gap-3">
                <Button variant="outline" onClick={openDirections}>Route / Directions (Google Maps)</Button>
                <Button variant="outline" onClick={openSatellite}>Open Satellite (Google Maps)</Button>
                <Button variant="primary" onClick={() => setChatOpen(true)} className="ml-auto">Contact / Message Owner</Button>
              </div>

              <div className="h-72 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-sm text-text-secondary">Click "Route" or "Open Satellite" to view the location in Google Maps.</div>
              </div>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Nearby</h4>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>Market: 900 m</li>
                <li>Clinic: 2.4 km</li>
                <li>Bus stop: 300 m</li>
              </ul>
            </Card>
          </div>

          <aside>
            <Card padding="lg">
              <h4 className="font-semibold mb-2">Rent</h4>
              <div className="text-2xl font-bold mb-4">{data.rent}</div>
              <Button fullWidth onClick={() => setChatOpen(true)}>Request Viewing / Message Owner</Button>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-text-secondary mb-4">Use the in-site chat to message the owner. Messages are stored in Supabase when active, and kept in local storage as a fallback.</p>
              <Button variant="outline" onClick={() => setChatOpen(true)}>Open Chat</Button>
            </Card>
          </aside>
        </div>
      </section>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-t-xl md:rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-lg font-semibold">Message Owner</div>
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