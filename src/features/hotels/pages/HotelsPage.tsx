import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building, Home, MapPin, Star, ArrowRight, Wifi, Coffee, Waves, Dumbbell, Heart, SlidersHorizontal, Navigation, Hospital, Trees } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { HOTEL_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';
import { fetchSupabaseHotels, isSupabaseConfigured } from '../../../lib/supabase';

const hotelTypes = Object.entries(HOTEL_TYPES);

const amenities = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Coffee, label: 'Breakfast' },
  { icon: Waves, label: 'Swimming Pool' },
  { icon: Dumbbell, label: 'Gym' },
];

const fallbackHotels = [
  {
    id: 'dar-marina-hotel',
    name: 'Dar Marina Suites',
    type: 'hotel',
    location: 'Mbezi Beach, Dar es Salaam',
    price: 220000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['Free WiFi', 'Pool', 'Breakfast'],
  },
  {
    id: 'coastal-bnbs',
    name: 'Coastal Airbnb Retreat',
    type: 'airbnb',
    location: 'Kigamboni, Dar es Salaam',
    price: 190000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    amenities: ['Kitchen', 'Parking', 'Sea View'],
  },
  {
    id: 'city-suites',
    name: 'City Suites Lodge',
    type: 'apartment',
    location: 'Mlimani, Dar es Salaam',
    price: 165000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    amenities: ['WiFi', 'Gym', 'Close to CBD'],
  },
  {
    id: 'palms-residence',
    name: 'Palms Residence',
    type: 'villa',
    location: 'Msasani, Dar es Salaam',
    price: 280000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80',
    amenities: ['Pool', 'Breakfast', 'Private kitchen'],
  },
];

export const HotelsPage = () => {
  const { t } = useI18n();
  const { items: hotels } = useApiCollection<any>('/hotels');
  const [searchParams] = useSearchParams();
  const [location, setLocation] = React.useState('');
  const [hotelType, setHotelType] = React.useState(searchParams.get('type') || 'all');
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [supabaseHotels, setSupabaseHotels] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchSupabaseHotels().then((items) => {
      if (Array.isArray(items)) {
        setSupabaseHotels(items.map((listing) => ({
          id: listing.id,
          name: listing.name,
          type: listing.type,
          location: listing.location,
          price: Number(listing.price ?? 0),
          rating: Number(listing.rating ?? 4.8),
          image: listing.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
          amenities: Array.isArray(listing.amenities) ? listing.amenities : ['WiFi', 'Breakfast'],
        })));
      }
    }).catch(() => setSupabaseHotels([]));
  }, []);

  const hotelData = Array.isArray(supabaseHotels) && supabaseHotels.length > 0
    ? supabaseHotels
    : (Array.isArray(hotels) && hotels.length > 0 ? hotels : fallbackHotels);
  const filteredHotels = hotelData.filter((hotel) =>
    (hotelType === 'all' || hotel.type === hotelType) && hotel.location.toLowerCase().includes(location.toLowerCase())
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setUserLocation({ lat: -6.7924, lng: 39.2083 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen">
      <PageHero
        tone={HERO_TONES.amber}
        eyebrow="Short-term Stays & Bookings"
        title={t('hotels.title')}
        subtitle={t('hotels.subtitle')}
        primaryCta={{ label: t('hotels.browseListings'), to: ROUTES.HOTELS_LISTINGS }}
        secondaryCta={{ label: t('hotels.addListing'), to: ROUTES.HOTELS_ADD }}
        image={{ src: '/images/hero/hotels.webp', alt: 'Hospitality and hotel illustration' }}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Property Types</h2>
            <p className="page-subtitle">From luxury hotels to cozy cottages</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotelTypes.map(([key, type]) => (
              <Link key={key} to={`${ROUTES.HOTELS_LISTINGS}?type=${key}`} className="card-hover group">
                <Card padding="lg" className="h-full text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#fef3ec' }}
                  >
                    <span className="text-2xl text-warning">
                      {type.icon === 'building' && <Building className="h-7 w-7" />}
                      {type.icon === 'home' && <Home className="h-7 w-7" />}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">{type.label}</h3>
                  <p className="mb-4 text-sm text-text-secondary">{type.labelSw}</p>
                  <Button variant="outline" className="w-full" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                    {t('common.viewAll')}
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="page-title">Featured Stays</h2>
              <p className="page-subtitle">Top-rated properties with instant booking</p>
            </div>
            <Link to={ROUTES.HOTELS_LISTINGS}>
              <Button variant="outline">
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:flex-row">
            <div className="flex-1">
              <input className="input border-0 shadow-none" placeholder="Search destination" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <select className="input sm:w-52" value={hotelType} onChange={(event) => setHotelType(event.target.value)} aria-label="Filter accommodation type">
              <option value="all">All accommodation types</option>
              {hotelTypes.map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
            <Button variant="outline" className="sm:w-auto">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <p className="mb-5 text-sm text-text-secondary">{filteredHotels.length} stays available</p>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="group relative">
                <Link to={`/hotels/${hotel.id}`}>
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                      <CardMedia src={hotel.image} alt={hotel.name} aspectRatio="4/3" />
                    </div>
                    <CardContent className="px-1 pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-text group-hover:text-primary">{hotel.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                            <MapPin className="h-3.5 w-3.5" />
                            {hotel.location}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-current text-warning" />
                          {hotel.rating}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{hotel.amenities.slice(0, 2).join(' · ')}</p>
                      <p className="mt-2">
                        <span className="font-bold text-text">TZS {hotel.price.toLocaleString()}</span>
                        <span className="text-sm text-text-secondary"> / night</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-text-secondary shadow-sm transition-colors hover:text-error" aria-label={`Save ${hotel.name}`}>
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-100">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="page-title">Nearby map & booking convenience</h2>
              <p className="page-subtitle">Know the area before checking in.</p>
            </div>
            <Button variant="outline" onClick={handleUseMyLocation} className="inline-flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Use my location
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
              <div className="relative h-[320px] overflow-hidden rounded-[22px] border border-slate-200 bg-slate-800">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-slate-900/20 to-slate-800/50" />
                <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-amber-500 shadow-lg" />
                {userLocation && (
                  <div className="absolute left-10 top-10 rounded-full bg-white/90 px-3 py-2 text-xs font-medium shadow-sm">
                    Your location
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Hospital className="h-4 w-4 text-primary" /> 3.0 km to clinic</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Trees className="h-4 w-4 text-primary" /> 0.9 km to beach walk</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Wifi className="h-4 w-4 text-primary" /> Fast connectivity</span>
              </div>
            </div>

            <div className="space-y-4">
              <Card padding="lg" className="bg-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Area Overview</p>
                <h3 className="mt-3 text-xl font-bold text-text">Stay near the best of the city</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Ideal for short stays, business travel, and weekend escapes with access to beaches, attractions, and transport corridors.
                </p>
              </Card>

              <Card padding="lg" className="bg-white">
                <h4 className="text-lg font-semibold text-text">Nearby essentials</h4>
                <ul className="mt-3 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Hospital className="h-4 w-4 text-primary" /> Clinic</span>
                    <span>3.0 km</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Trees className="h-4 w-4 text-primary" /> Beach walk</span>
                    <span>0.9 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /> Connectivity</span>
                    <span>Available</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Popular Amenities</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {amenities.map((amenity, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center gradient-primary">
                  <amenity.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{amenity.label}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Book Your Perfect Stay</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Discover unique accommodations across Tanzania with verified hosts and secure booking.
          </p>
          <Link to={ROUTES.HOTELS_LISTINGS}>
            <Button size="lg" className="bg-white px-8 text-primary hover:bg-gray-100">
              Browse Stays
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};