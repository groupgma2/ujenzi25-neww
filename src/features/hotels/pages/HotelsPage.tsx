import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building, Home, MapPin, Star, ArrowRight, Wifi, Coffee, Waves, Dumbbell, Heart, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { HOTEL_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const hotelTypes = Object.entries(HOTEL_TYPES);

const amenities = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Coffee, label: 'Breakfast' },
  { icon: Waves, label: 'Swimming Pool' },
  { icon: Dumbbell, label: 'Gym' },
];

export const HotelsPage = () => {
  const { t } = useI18n();
  const { items: hotels } = useApiCollection<any>('/hotels');
  const [searchParams] = useSearchParams();
  const [location, setLocation] = React.useState('');
  const [hotelType, setHotelType] = React.useState(searchParams.get('type') || 'all');
  const filteredHotels = hotels.filter((hotel) =>
    (hotelType === 'all' || hotel.type === hotelType) &&
    hotel.location.toLowerCase().includes(location.toLowerCase())
  );

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotelTypes.map(([key, type]) => (
              <Link
                key={key}
                to={`${ROUTES.HOTELS_LISTINGS}?type=${key}`}
                className="card-hover group"
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#fef3ec' }}
                  >
                    <span className="text-2xl text-warning">
                      {type.icon === 'building' && <Building className="w-7 h-7" />}
                      {type.icon === 'home' && <Home className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">{type.labelSw}</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="page-title">Featured Stays</h2>
              <p className="page-subtitle">Top-rated properties with instant booking</p>
            </div>
            <Link to={ROUTES.HOTELS_LISTINGS}>
              <Button variant="outline">{t('common.viewAll')}<ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:flex-row">
            <div className="flex-1"><input className="input border-0 shadow-none" placeholder="Search destination" value={location} onChange={(event) => setLocation(event.target.value)} /></div>
            <select className="input sm:w-52" value={hotelType} onChange={(event) => setHotelType(event.target.value)} aria-label="Filter accommodation type">
              <option value="all">All accommodation types</option>
              {hotelTypes.map(([key, type]) => <option key={key} value={key}>{type.label}</option>)}
            </select>
            <Button variant="outline" className="sm:w-auto"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
          </div>
          <p className="mb-5 text-sm text-text-secondary">{filteredHotels.length} stays available</p>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="group relative">
                <Link to={`/hotels/${hotel.id}`}>
                  <Card className="h-full border-0 bg-transparent shadow-none">
                    <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm"><CardMedia src={hotel.image} alt={hotel.name} aspectRatio="4/3" /></div>
                    <CardContent className="px-1 pt-3">
                      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-text group-hover:text-primary">{hotel.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-text-secondary"><MapPin className="h-3.5 w-3.5" />{hotel.location}</p></div><div className="flex shrink-0 items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-current text-warning" />{hotel.rating}</div></div>
                      <p className="mt-2 text-sm text-text-secondary">{hotel.amenities.slice(0, 2).join(' · ')}</p>
                      <p className="mt-2"><span className="font-bold text-text">TZS {hotel.price.toLocaleString()}</span><span className="text-sm text-text-secondary"> / night</span></p>
                    </CardContent>
                  </Card>
                </Link>
                <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-text-secondary shadow-sm transition-colors hover:text-error" aria-label={`Save ${hotel.name}`}><Heart className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Popular Amenities</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <amenity.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{amenity.label}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Book Your Perfect Stay
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover unique accommodations across Tanzania with verified hosts and secure booking.
          </p>
          <Link to={ROUTES.HOTELS_LISTINGS}>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8">
              Browse Stays
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};