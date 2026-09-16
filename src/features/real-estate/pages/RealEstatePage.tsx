import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Shield, FileText, ArrowRight, MapPin, Building, DollarSign, Navigation, Wifi, Droplets, Hospital, Trees } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { Badge, StatusBadge } from '../../../shared/ui/Badge';
import { PROPERTY_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';
import { fetchSupabaseProperties, isSupabaseConfigured } from '../../../lib/supabase';

const propertyTypes = Object.entries(PROPERTY_TYPES);

const features = [
  { icon: Shield, title: 'Verified Listings', description: 'Ownership documents verified by our team' },
  { icon: FileText, title: 'Complete Documentation', description: 'Title deeds, survey plans & valuations' },
  { icon: MapPin, title: 'Nationwide Coverage', description: 'Properties across all Tanzania regions' },
  { icon: DollarSign, title: 'Transparent Pricing', description: 'No hidden fees or commissions' },
];

const fallbackProperties = [
  {
    id: 'mandera-villa',
    title: 'Modern Villa in Mikocheni',
    type: 'villa',
    location: 'Mikocheni, Dar es Salaam',
    price: 185000000,
    size: '360 m²',
    verified: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    amenities: ['Maji', 'Umeme', 'Kituo cha afya', 'Gated community'],
    distanceToHospital: '2.1 km',
  },
  {
    id: 'kimara-apartment',
    title: 'Contemporary Apartment',
    type: 'apartment',
    location: 'Kimara, Dar es Salaam',
    price: 76000000,
    size: '180 m²',
    verified: true,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    amenities: ['Maji', 'Umeme', 'Parking', 'Security'],
    distanceToHospital: '1.8 km',
  },
  {
    id: 'kigamboni-land',
    title: 'Prime Plot in Kigamboni',
    type: 'land',
    location: 'Kigamboni, Dar es Salaam',
    price: 42000000,
    size: '540 m²',
    verified: false,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    amenities: ['Road access', 'Electricity', 'Water nearby', 'Near township'],
    distanceToHospital: '4.7 km',
  },
  {
    id: 'msasani-bungalow',
    title: 'Family Bungalow by the Coast',
    type: 'house',
    location: 'Msasani, Dar es Salaam',
    price: 210000000,
    size: '420 m²',
    verified: true,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    amenities: ['Pond', 'Garden', 'Garage', 'School nearby'],
    distanceToHospital: '3.0 km',
  },
];

export const RealEstatePage = () => {
  const { t } = useI18n();
  const { items: properties } = useApiCollection<any>('/properties');
  const [propertyType, setPropertyType] = React.useState('all');
  const [location, setLocation] = React.useState('');
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [supabaseProperties, setSupabaseProperties] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchSupabaseProperties().then((items) => {
      if (Array.isArray(items)) {
        setSupabaseProperties(items.map((property) => ({
          id: property.id,
          title: property.title,
          type: property.type,
          location: property.location,
          price: Number(property.price ?? 0),
          size: property.size ?? 'N/A',
          verified: Boolean(property.verified),
          image: property.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
          amenities: [property.description ? 'Utilities' : 'Maji', 'Umeme'],
          distanceToHospital: 'Nearby',
        })));
      }
    }).catch(() => setSupabaseProperties([]));
  }, []);

  const propertyData = Array.isArray(supabaseProperties) && supabaseProperties.length > 0
    ? supabaseProperties
    : (Array.isArray(properties) && properties.length > 0 ? properties : fallbackProperties);

  const filteredProperties = propertyData.filter((property) => {
    const matchesType = propertyType === 'all' || property.type === propertyType;
    const matchesLocation = property.location.toLowerCase().includes(location.toLowerCase());
    return matchesType && matchesLocation;
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
        tone={HERO_TONES.teal}
        eyebrow="Verified Property Listings & Development"
        title={t('realEstate.title')}
        subtitle={t('realEstate.subtitle')}
        primaryCta={{ label: t('realEstate.browseProperties'), to: ROUTES.REAL_ESTATE_LISTINGS }}
        secondaryCta={{ label: t('realEstate.addProperty'), to: ROUTES.REAL_ESTATE_ADD }}
        image={{ src: '/images/hero/real-estate.webp', alt: 'Real estate buildings illustration' }}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Property Types</h2>
            <p className="page-subtitle">Find the right property for your needs</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {propertyTypes.map(([key, type]) => (
              <Link key={key} to={`${ROUTES.REAL_ESTATE_LISTINGS}?type=${key}`} className="card-hover group">
                <Card padding="lg" className="h-full text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#f0f9fc' }}
                  >
                    <span className="text-2xl text-accent">
                      {type.icon === 'map-pin' && <MapPin className="h-7 w-7" />}
                      {type.icon === 'tractor' && <Building className="h-7 w-7" />}
                      {type.icon === 'home' && <Home className="h-7 w-7" />}
                      {type.icon === 'building' && <Building className="h-7 w-7" />}
                      {type.icon === 'layers' && <Building className="h-7 w-7" />}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">{type.label}</h3>
                  <p className="mb-4 text-sm text-text-secondary">{type.labelSw}</p>
                  <Button variant="outline" className="w-full" style={{ borderColor: '#00b4d8', color: '#00b4d8' }}>
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
              <h2 className="page-title">Featured Properties</h2>
              <p className="page-subtitle">Verified listings ready for viewing</p>
            </div>
            <Link to={ROUTES.REAL_ESTATE_LISTINGS}>
              <Button variant="outline">
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              className="input flex-1"
              placeholder="Search location, city or property"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <select className="input sm:w-56" value={propertyType} onChange={(event) => setPropertyType(event.target.value)} aria-label="Filter property type">
              <option value="all">All property types</option>
              {propertyTypes.map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/real-estate/${property.id}`} className="card-hover group">
                <Card className="h-full">
                  <CardMedia src={property.image} alt={property.title} aspectRatio="16/10" />
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <StatusBadge status={property.verified ? 'verified' : 'basic'} />
                      <Badge variant="secondary" className="text-xs">
                        {PROPERTY_TYPES[property.type as keyof typeof PROPERTY_TYPES]?.label || property.type}
                      </Badge>
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">{property.title}</h3>
                    <p className="mb-2 flex items-center gap-1 text-sm text-text-secondary">
                      <MapPin className="h-3.5 w-3.5" />
                      {property.location}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-text-secondary">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                        <Droplets className="h-3 w-3" /> {property.amenities?.[0] || 'Maji'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                        <Wifi className="h-3 w-3" /> {property.amenities?.[1] || 'Umeme'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">TZS {property.price.toLocaleString()}</span>
                      <span className="text-sm text-text-muted">{property.size}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-100">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="page-title">Map & Location Discovery</h2>
              <p className="page-subtitle">Find nearby facilities and understand the area before you visit.</p>
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
                <div className="absolute inset-0 bg-gradient-to-br from-sky-950/30 via-slate-900/20 to-slate-800/50" />
                <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary shadow-lg" />
                {userLocation && (
                  <div className="absolute left-10 top-10 rounded-full bg-white/90 px-3 py-2 text-xs font-medium shadow-sm">
                    Your location
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Hospital className="h-4 w-4 text-primary" /> 2 km to hospital
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Trees className="h-4 w-4 text-primary" /> 1.5 km to green area
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Wifi className="h-4 w-4 text-primary" /> Utilities available
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Card padding="lg" className="bg-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Area Overview</p>
                <h3 className="mt-3 text-xl font-bold text-text">Prime residential district</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Housing near schools, hospitals, shopping centers, and main roads with easy access to the city and coastal areas.
                </p>
              </Card>

              <Card padding="lg" className="bg-white">
                <h4 className="text-lg font-semibold text-text">Nearby essentials</h4>
                <ul className="mt-3 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Hospital className="h-4 w-4 text-primary" /> Hospital</span>
                    <span>2.1 km</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-2"><Trees className="h-4 w-4 text-primary" /> Park / green space</span>
                    <span>1.2 km</span>
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
            <h2 className="page-title">Why Choose UJENZI 25 Real Estate?</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
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
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Find Your Perfect Property</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Browse verified listings, schedule viewings, and make secure transactions with expert guidance.
          </p>
          <Link to={ROUTES.REAL_ESTATE_LISTINGS}>
            <Button size="lg" className="bg-white px-8 text-primary hover:bg-gray-100">
              Browse Properties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};