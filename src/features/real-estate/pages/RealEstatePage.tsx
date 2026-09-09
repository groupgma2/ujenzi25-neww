import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Shield, FileText, ArrowRight, MapPin, Building, DollarSign } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { Badge, StatusBadge } from '../../../shared/ui/Badge';
import { PROPERTY_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const propertyTypes = Object.entries(PROPERTY_TYPES);

const features = [
  { icon: Shield, title: 'Verified Listings', description: 'Ownership documents verified by our team' },
  { icon: FileText, title: 'Complete Documentation', description: 'Title deeds, survey plans & valuations' },
  { icon: MapPin, title: 'Nationwide Coverage', description: 'Properties across all Tanzania regions' },
  { icon: DollarSign, title: 'Transparent Pricing', description: 'No hidden fees or commissions' },
];

export const RealEstatePage = () => {
  const { t } = useI18n();
  const { items: properties } = useApiCollection<any>('/properties');
  const [propertyType, setPropertyType] = React.useState('all');
  const [location, setLocation] = React.useState('');
  const filteredProperties = properties.filter((property) => {
    const matchesType = propertyType === 'all' || property.type === propertyType;
    const matchesLocation = property.location.toLowerCase().includes(location.toLowerCase());
    return matchesType && matchesLocation;
  });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {propertyTypes.map(([key, type]) => (
              <Link
                key={key}
                to={`${ROUTES.REAL_ESTATE_LISTINGS}?type=${key}`}
                className="card-hover group"
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#f0f9fc' }}
                  >
                    <span className="text-2xl text-accent">
                      {type.icon === 'map-pin' && <MapPin className="w-7 h-7" />}
                      {type.icon === 'tractor' && <Building className="w-7 h-7" />}
                      {type.icon === 'home' && <Home className="w-7 h-7" />}
                      {type.icon === 'building' && <Building className="w-7 h-7" />}
                      {type.icon === 'layers' && <Building className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">{type.labelSw}</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="page-title">Featured Properties</h2>
              <p className="page-subtitle">Verified listings ready for viewing</p>
            </div>
            <Link to={ROUTES.REAL_ESTATE_LISTINGS}>
              <Button variant="outline">{t('common.viewAll')}<ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input className="input flex-1" placeholder="Search location, city or property" value={location} onChange={(event) => setLocation(event.target.value)} />
            <select className="input sm:w-56" value={propertyType} onChange={(event) => setPropertyType(event.target.value)} aria-label="Filter property type">
              <option value="all">All property types</option>
              {propertyTypes.map(([key, type]) => <option key={key} value={key}>{type.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/real-estate/${property.id}`} className="card-hover group">
                <Card className="h-full">
                  <CardMedia
                    src={property.image}
                    alt={property.title}
                    aspectRatio="16/10"
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StatusBadge status={property.verified ? 'verified' : 'basic'} />
                      <Badge variant="secondary" className="text-xs">
                        {PROPERTY_TYPES[property.type as keyof typeof PROPERTY_TYPES]?.label || property.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-text-secondary flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {property.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        TZS {property.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-text-muted">{property.size}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Why Choose UJENZI 25 Real Estate?</h2>
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
            Find Your Perfect Property
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Browse verified listings, schedule viewings, and make secure transactions with expert guidance.
          </p>
          <Link to={ROUTES.REAL_ESTATE_LISTINGS}>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8">
              Browse Properties
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};