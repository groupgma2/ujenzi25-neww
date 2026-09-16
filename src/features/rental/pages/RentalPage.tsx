import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, MapPin, Shield, Calendar, ArrowRight, Bed, Users, Heart, SlidersHorizontal, Navigation, Wifi, Droplets, Hospital, Trees } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { HOUSE_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';
import { fetchSupabaseRentals, isSupabaseConfigured } from '../../../lib/supabase';

const houseTypes = Object.entries(HOUSE_TYPES);

const features = [
  { icon: Shield, title: 'Verified Landlords', description: 'Identity and ownership verified' },
  { icon: MapPin, title: 'Detailed Locations', description: 'Street-level accuracy with maps' },
  { icon: Calendar, title: 'Flexible Move-in', description: 'Immediate to future availability' },
  { icon: Users, title: 'Direct Communication', description: 'Chat with landlords securely' },
];

const fallbackRentals = [
  {
    id: 'mbezi-2bed',
    title: '2-Bedroom Apartment in Mbezi',
    type: 'apartment',
    location: 'Mbezi Beach, Dar es Salaam',
    bedrooms: 2,
    bathrooms: 2,
    rent: 1400000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    verified: true,
  },
  {
    id: 'mikocheni-3bed',
    title: '3-Bedroom Family House',
    type: 'house',
    location: 'Mikocheni, Dar es Salaam',
    bedrooms: 3,
    bathrooms: 3,
    rent: 2100000,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    verified: true,
  },
  {
    id: 'upanga-studio',
    title: 'Studio Flat with Balcony',
    type: 'studio',
    location: 'Upanga, Dar es Salaam',
    bedrooms: 1,
    bathrooms: 1,
    rent: 950000,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    verified: false,
  },
  {
    id: 'kigamboni-townhouse',
    title: 'Townhouse for Rent',
    type: 'townhouse',
    location: 'Kigamboni, Dar es Salaam',
    bedrooms: 4,
    bathrooms: 3,
    rent: 2900000,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    verified: true,
  },
];

export const RentalPage = () => {
  const { t } = useI18n();
  const { items: rentals } = useApiCollection<any>('/rentals');
  const [searchParams] = useSearchParams();
  const [location, setLocation] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState('all');
  const [houseType, setHouseType] = React.useState(searchParams.get('type') || 'all');
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [supabaseRentals, setSupabaseRentals] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchSupabaseRentals().then((items) => {
      if (Array.isArray(items)) {
        setSupabaseRentals(items.map((listing) => ({
          id: listing.id,
          title: listing.title,
          type: listing.type,
          location: listing.location,
          bedrooms: Number(listing.bedrooms ?? 1),
          bathrooms: Number(listing.bathrooms ?? 1),
          rent: Number(listing.rent ?? 0),
          image: listing.image_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
          verified: Boolean(listing.verified),
        })));
      }
    }).catch(() => setSupabaseRentals([]));
  }, []);

  const rentalData = Array.isArray(supabaseRentals) && supabaseRentals.length > 0
    ? supabaseRentals
    : (Array.isArray(rentals) && rentals.length > 0 ? rentals : fallbackRentals);
  const filteredListings = rentalData.filter((listing) => {
    const matchesLocation = listing.location.toLowerCase().includes(location.toLowerCase());
    const matchesBedrooms = bedrooms === 'all' || listing.bedrooms === Number(bedrooms);
    const matchesType = houseType === 'all' || listing.type === houseType;
    return matchesLocation && matchesBedrooms && matchesType;
  });

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
        tone={HERO_TONES.green}
        eyebrow="Long-term Rental Housing"
        title={t('rental.title')}
        subtitle={t('rental.subtitle')}
        primaryCta={{ label: t('rental.browseListings'), to: ROUTES.RENTAL_LISTINGS }}
        secondaryCta={{ label: t('rental.addListing'), to: ROUTES.RENTAL_ADD }}
        image={{ src: '/images/hero/rental.webp', alt: 'Rental homes illustration' }}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">House Types</h2>
            <p className="page-subtitle">Choose the type that suits your lifestyle</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {houseTypes.map(([key, type]) => (
              <Link key={key} to={`${ROUTES.RENTAL_LISTINGS}?type=${key}`} className="card-hover group">
                <Card padding="lg" className="h-full text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#f0fdf4' }}
                  >
                    <span className="text-2xl text-success">
                      {type.icon === 'door' && <Bed className="h-7 w-7" />}
                      {type.icon === 'building' && <Home className="h-7 w-7" />}
                      {type.icon === 'home' && <Home className="h-7 w-7" />}
                      {type.icon === 'users' && <Users className="h-7 w-7" />}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">{type.label}</h3>
                  <p className="mb-4 text-sm text-text-secondary">{type.labelSw}</p>
                  <Button variant="outline" className="w-full" style={{ borderColor: '#10b981', color: '#10b981' }}>
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
              <h2 className="page-title">Available Rentals</h2>
              <p className="page-subtitle">Verified listings with transparent pricing</p>
            </div>
            <Link to={ROUTES.RENTAL_LISTINGS}>
              <Button variant="outline">
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:flex-row">
            <div className="flex-1">
              <input className="input border-0 shadow-none" placeholder="Search location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <select className="input sm:w-44" value={houseType} onChange={(event) => setHouseType(event.target.value)} aria-label="Filter house type">
              <option value="all">All house types</option>
              {houseTypes.map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
            <select className="input sm:w-36" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} aria-label="Filter bedrooms">
              <option value="all">Bedrooms</option>
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>{count} BR</option>
              ))}
            </select>
            <Button variant="outline" className="sm:w-auto">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <p className="mb-5 text-sm text-text-secondary">{filteredListings.length} homes available</p>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="group relative">
                <Link to={`/rental/${listing.id}`}>
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                      <CardMedia src={listing.image} alt={listing.title} aspectRatio="4/3" />
                    </div>
                    <CardContent className="px-1 pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-text group-hover:text-primary">{listing.title}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                            <MapPin className="h-3.5 w-3.5" />
                            {listing.location}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-sm">
                          <span className="text-warning">★</span>
                          {listing.verified ? '4.8' : '4.5'}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-text-secondary">
                        <span>{listing.bedrooms} bedrooms</span>
                        <span>·</span>
                        <span>{listing.bathrooms} bathrooms</span>
                      </div>
                      <p className="mt-2">
                        <span className="font-bold text-text">TZS {listing.rent.toLocaleString()}</span>
                        <span className="text-sm text-text-secondary"> / month</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-text-secondary shadow-sm transition-colors hover:text-error" aria-label={`Save ${listing.title}`}>
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
              <h2 className="page-title">Location map</h2>
              <p className="page-subtitle">See nearby services and decide where to live faster.</p>
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
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-900/20 to-slate-800/50" />
                <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-500 shadow-lg" />
                {userLocation && (
                  <div className="absolute left-10 top-10 rounded-full bg-white/90 px-3 py-2 text-xs font-medium shadow-sm">
                    Your location
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Hospital className="h-4 w-4 text-primary" /> 2.5 km to hospital</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Trees className="h-4 w-4 text-primary" /> 1.1 km to park</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5"><Wifi className="h-4 w-4 text-primary" /> Utilities available</span>
              </div>
            </div>

            <div className="space-y-4">
              <Card padding="lg" className="bg-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Area Overview</p>
                <h3 className="mt-3 text-xl font-bold text-text">Safe and convenient neighborhood</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Most rental homes are located near schools, clinics, markets, and transport hubs, making it easy to settle in quickly.
                </p>
              </Card>

              <Card padding="lg" className="bg-white">
                <h4 className="text-lg font-semibold text-text">Nearby essentials</h4>
                <ul className="mt-3 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Hospital className="h-4 w-4 text-primary" /> Hospital</span>
                    <span>2.5 km</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Trees className="h-4 w-4 text-primary" /> Green area</span>
                    <span>1.1 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /> Utilities</span>
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
            <h2 className="page-title">Why Rent Through UJENZI 25?</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center gradient-primary">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Find Your New Home Today</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Browse verified rentals, contact landlords directly, and secure your lease with confidence.
          </p>
          <Link to={ROUTES.RENTAL_LISTINGS}>
            <Button size="lg" className="bg-white px-8 text-primary hover:bg-gray-100">
              Browse Rentals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};