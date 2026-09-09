import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Building, Home, Hotel, Hammer, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { Card, CardMedia, CardContent } from '../shared/ui/Card';
import { Badge } from '../shared/ui/Badge';
import { SERVICE_CATEGORIES } from '../types';
import { ROUTES } from '../shared/constants';
import { useApiCollection } from '../shared/hooks/useApiCollection';

const features = [
  { icon: Shield, title: 'Clear service workflows', description: 'Move from enquiry to fulfilment with each step visible' },
  { icon: Clock, title: 'Status tracking', description: 'Keep requests, documents, and updates in one place' },
  { icon: MapPin, title: 'Location-ready services', description: 'Capture the location details your project requires' },
  { icon: Building, title: 'One connected platform', description: 'Construction, property, rental, and stays in one system' },
];

const heroSlides = [
  {
    image: '/images/hero/construction.webp',
    eyebrow: 'Construction',
    title: 'Build with Confidence',
    subtitle: 'Quality building materials and skilled labour teams for every project, delivered across Tanzania.',
    cta: { label: 'Browse Materials', to: ROUTES.CONSTRUCTION },
  },
  {
    image: '/images/hero/real-estate.webp',
    eyebrow: 'Real Estate',
    title: 'Find Your Property',
    subtitle: 'Verified listings, transparent pricing and complete documentation for land and buildings.',
    cta: { label: 'Browse Properties', to: ROUTES.REAL_ESTATE },
  },
  {
    image: '/images/hero/hotels.webp',
    eyebrow: 'Hotels & Stays',
    title: 'Book Your Perfect Stay',
    subtitle: 'Short-term stays and Airbnb experiences with verified hosts and instant booking.',
    cta: { label: 'Browse Stays', to: ROUTES.HOTELS },
  },
  {
    image: '/images/hero/consultation.webp',
    eyebrow: 'Consultation',
    title: 'Expert Civil Consultation',
    subtitle: 'Architectural, structural and services drawings, BoQ and construction management from licensed professionals.',
    cta: { label: 'Request Consultation', to: ROUTES.CONSULTATION },
  },
  {
    image: '/images/hero/rental.webp',
    eyebrow: 'Rental Housing',
    title: 'Find Your New Home',
    subtitle: 'Long-term rentals with verified landlords and transparent pricing across every region.',
    cta: { label: 'Browse Rentals', to: ROUTES.RENTAL },
  },
];

export const HomePage = () => {
  const { t } = useI18n();
  const { items: properties } = useApiCollection<any>('/properties');

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative h-[560px] overflow-hidden bg-[#0f1220] sm:h-[600px] lg:h-[640px]">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f1c]/95 via-[#0c0f1c]/75 to-[#0c0f1c]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1c]/80 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,transparent_38%,rgba(255,255,255,0.05)_100%)]" />
            <div className="container relative flex h-full items-center">
              <div className="max-w-2xl py-16 lg:py-24">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {slide.eyebrow}
                </span>
                <h1 className="text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
                  {slide.subtitle}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={slide.cta.to}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-gray-100"
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to={ROUTES.PORTFOLIO}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/60 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    {t('nav.portfolio')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setCurrentSlide((cur) => (cur - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((cur) => (cur + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Service Categories Preview */}
      <section className="relative z-10 -mt-16 pb-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SERVICE_CATEGORIES.map((category, index) => (
              <Link
                key={category.id}
                to={`/${category.slug}`}
                className="group card-hover animate-slide-up rounded-2xl border border-border bg-white p-6 text-center shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center transition-colors group-hover:scale-110"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <span className="text-2xl" style={{ color: category.color }}>
                    {category.icon === 'drafting' && <FileText className="w-8 h-8" />}
                    {category.icon === 'hammer' && <Hammer className="w-8 h-8" />}
                    {category.icon === 'building' && <Building className="w-8 h-8" />}
                    {category.icon === 'home' && <Home className="w-8 h-8" />}
                    {category.icon === 'bed' && <Hotel className="w-8 h-8" />}
                  </span>
                </div>
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Our Services</h2>
            <p className="page-subtitle">Five interconnected pillars for all your property & construction needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {SERVICE_CATEGORIES.map((category, index) => (
              <Link
                key={category.id}
                to={`/${category.slug}`}
                className="card-hover group"
              >
                <CardMedia
                  src={`/images/hero/${category.slug}.webp`}
                  alt={category.name}
                  aspectRatio="4/3"
                />
                <CardContent className="p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <span style={{ color: category.color }}>
                      {category.icon === 'drafting' && <FileText className="w-5 h-5" />}
                      {category.icon === 'hammer' && <Hammer className="w-5 h-5" />}
                      {category.icon === 'building' && <Building className="w-5 h-5" />}
                      {category.icon === 'home' && <Home className="w-5 h-5" />}
                      {category.icon === 'bed' && <Hotel className="w-5 h-5" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {t('common.learnMore')}
                      <ArrowRight className="w-4 h-4 inline ml-1" />
                    </span>
                    <Badge variant="primary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">{t('common.appName')} Advantage</h2>
            <p className="page-subtitle max-w-2xl mx-auto">Why thousands choose us for their construction & property needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Featured Properties</h2>
            <p className="page-subtitle">Handpicked listings across Tanzania</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-gray-50 p-10 text-center text-text-secondary">
                No properties are available yet. Published listings will appear here.
              </div>
            ) : properties.map((p) => (
              <Card key={p.id} hover>
                <CardMedia src={p.image} alt={p.title} aspectRatio="16/10" />
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{p.title}</h3>
                      <p className="text-sm text-text-secondary">{p.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{p.price}</div>
                      <div className="text-sm text-text-muted">{p.type}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
                    <span>{p.beds} beds</span>
                    <span>{p.baths} baths</span>
                    <span>{p.area}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link to={`/real-estate/${p.id}`} className="text-sm font-medium text-primary">
                      View Details <ArrowRight className="w-4 h-4 inline ml-1" />
                    </Link>
                    <Button size="sm" className="btn-outline">Contact</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients. Get professional consultation, quality materials, verified properties, and seamless bookings all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.CONSULTATION}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto px-8">
                Get Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};