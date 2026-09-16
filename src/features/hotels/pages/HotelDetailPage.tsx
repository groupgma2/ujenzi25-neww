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

export const HotelDetailPage = () => {
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
        name: 'Dar Marina Suites',
        price: 'TZS 220,000 / night',
        images: ['/images/samples/hotel1.webp'],
        description: 'Comfortable suites with breakfast and pool access.',
        location: { lat: -6.8, lng: 39.28 },
      };

      try {
        if (isSupabaseConfigured) {
          const hotel = await fetchSupabaseListingById('hotels', id);
          if (hotel && active) {
            setData({
              id: hotel.id,
              name: hotel.name,
              price: `TZS ${Number(hotel.price ?? 0).toLocaleString()} / night`,
              images: [hotel.image_url || fallback.images[0]],
              description: hotel.description || fallback.description,
              location: { lat: Number(hotel.latitude ?? -6.8), lng: Number(hotel.longitude ?? 39.28) },
            });

            const savedMessages = await fetchSupabaseMessagesByContext('hotel', id);
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
        const stored = localStorage.getItem(`inbox:hotel:${id}`);
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
      localStorage.setItem(`inbox:hotel:${id}`, JSON.stringify(messages));
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
          thread_id: `hotel-${id}`,
          context_type: 'hotel',
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
        tone={HERO_TONES.amber}
        eyebrow="Hospitality & Short Stays"
        title={data.name}
        subtitle={data.price}
        primaryCta={{ label: 'Message Host', to: '#' }}
        image={{ src: data.images[0], alt: data.name }}
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
                <Button variant="primary" onClick={() => setChatOpen(true)} className="ml-auto">Contact / Message Host</Button>
              </div>

              <div className="h-72 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-sm text-text-secondary">Click "Route" or "Open Satellite" to view the location in Google Maps.</div>
              </div>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Nearby</h4>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>Beach: 1.2 km</li>
                <li>Cafe: 400 m</li>
                <li>Airport shuttle: available</li>
              </ul>
            </Card>
          </div>

          <aside>
            <Card padding="lg">
              <h4 className="font-semibold mb-2">Price</h4>
              <div className="text-2xl font-bold mb-4">{data.price}</div>
              <Button fullWidth onClick={() => setChatOpen(true)}>Request Booking / Message Host</Button>
            </Card>

            <Card padding="lg" className="mt-4">
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-text-secondary mb-4">Use the in-site chat to message the host. Messages are saved to Supabase when active and stored locally as a fallback.</p>
              <Button variant="outline" onClick={() => setChatOpen(true)}>Open Chat</Button>
            </Card>
          </aside>
        </div>
      </section>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-t-xl md:rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-lg font-semibold">Message Host</div>
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