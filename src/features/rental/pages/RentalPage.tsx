import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, MapPin, Shield, Calendar, ArrowRight, Bed, Users, Heart, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { HOUSE_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const houseTypes = Object.entries(HOUSE_TYPES);

const features = [
  { icon: Shield, title: 'Verified Landlords', description: 'Identity and ownership verified' },
  { icon: MapPin, title: 'Detailed Locations', description: 'Street-level accuracy with maps' },
  { icon: Calendar, title: 'Flexible Move-in', description: 'Immediate to future availability' },
  { icon: Users, title: 'Direct Communication', description: 'Chat with landlords securely' },
];

export const RentalPage = () => {
  const { t } = useI18n();
  const { items: rentals } = useApiCollection<any>('/rentals');
  const [searchParams] = useSearchParams();
  const [location, setLocation] = React.useState('');
  const [bedrooms, setBedrooms] = React.useState('all');
  const [houseType, setHouseType] = React.useState(searchParams.get('type') || 'all');
  const filteredListings = rentals.filter((listing) => {
    const matchesLocation = listing.location.toLowerCase().includes(location.toLowerCase());
    const matchesBedrooms = bedrooms === 'all' || listing.bedrooms === Number(bedrooms);
    const matchesType = houseType === 'all' || listing.type === houseType;
    return matchesLocation && matchesBedrooms && matchesType;
  });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {houseTypes.map(([key, type]) => (
              <Link
                key={key}
                to={`${ROUTES.RENTAL_LISTINGS}?type=${key}`}
                className="card-hover group"
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#f0fdf4' }}
                  >
                    <span className="text-2xl text-success">
                      {type.icon === 'door' && <Bed className="w-7 h-7" />}
                      {type.icon === 'building' && <Home className="w-7 h-7" />}
                      {type.icon === 'home' && <Home className="w-7 h-7" />}
                      {type.icon === 'users' && <Users className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">{type.labelSw}</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="page-title">Available Rentals</h2>
              <p className="page-subtitle">Verified listings with transparent pricing</p>
            </div>
            <Link to={ROUTES.RENTAL_LISTINGS}>
              <Button variant="outline">{t('common.viewAll')}<ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:flex-row">
            <div className="flex-1">
              <input className="input border-0 shadow-none" placeholder="Search location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <select className="input sm:w-44" value={houseType} onChange={(event) => setHouseType(event.target.value)} aria-label="Filter house type">
              <option value="all">All house types</option>
              {houseTypes.map(([key, type]) => <option key={key} value={key}>{type.label}</option>)}
            </select>
            <select className="input sm:w-36" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} aria-label="Filter bedrooms">
              <option value="all">Bedrooms</option>
              {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} BR</option>)}
            </select>
            <Button variant="outline" className="sm:w-auto"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
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
                          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary"><MapPin className="h-3.5 w-3.5" />{listing.location}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-sm"><span className="text-warning">★</span>{listing.verified ? '4.8' : '4.5'}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-text-secondary"><span>{listing.bedrooms} bedrooms</span><span>·</span><span>{listing.bathrooms} bathrooms</span></div>
                      <p className="mt-2"><span className="font-bold text-text">TZS {listing.rent.toLocaleString()}</span><span className="text-sm text-text-secondary"> / month</span></p>
                    </CardContent>
                  </Card>
                </Link>
                <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-text-secondary shadow-sm transition-colors hover:text-error" aria-label={`Save ${listing.title}`}><Heart className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Why Rent Through UJENZI 25?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find Your New Home Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Browse verified rentals, contact landlords directly, and secure your lease with confidence.
          </p>
          <Link to={ROUTES.RENTAL_LISTINGS}>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8">
              Browse Rentals
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};