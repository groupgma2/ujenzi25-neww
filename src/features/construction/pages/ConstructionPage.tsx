import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Hammer, Truck, CreditCard, Shield, Users, Star, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { MATERIAL_CATEGORIES, LABOUR_CATEGORIES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const materialCategories = Object.entries(MATERIAL_CATEGORIES);
const labourCategories = Object.entries(LABOUR_CATEGORIES);

const features = [
  { icon: Shield, title: 'Verified Suppliers', description: 'All materials from certified suppliers' },
  { icon: Truck, title: 'Nationwide Delivery', description: 'Delivery to any location in Tanzania' },
  { icon: CreditCard, title: 'Flexible Payments', description: 'Mobile money, bank transfer & cards' },
  { icon: Users, title: 'Skilled Labour', description: 'Vetted teams for every trade' },
];

export const ConstructionPage = () => {
  const { t } = useI18n();
  const { items: products } = useApiCollection<any>('/products');
  const [searchParams] = useSearchParams();
  const [cartCount, setCartCount] = React.useState(0);
  const selectedCategory = searchParams.get('category') || 'all';
  const filteredProducts = products.filter((product) => selectedCategory === 'all' || product.category === selectedCategory);

  return (
    <div className="min-h-screen">
            <PageHero
        tone={HERO_TONES.secondary}
        eyebrow="Building Materials & Labour Marketplace"
        title={t('construction.title')}
        subtitle={t('construction.subtitle')}
        primaryCta={{ label: t('construction.browseMaterials'), to: ROUTES.CONSTRUCTION_MATERIALS }}
        secondaryCta={{ label: t('construction.postJob'), to: ROUTES.CONSTRUCTION_POST_JOB }}
        image={{ src: '/images/hero/construction.webp', alt: 'Construction materials illustration' }}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">{t('construction.materials')}</h2>
            <p className="page-subtitle">Quality building materials from verified suppliers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialCategories.map(([key, category]) => (
              <Link
                key={key}
                to={`${ROUTES.CONSTRUCTION_MATERIALS}?category=${key}`}
                className="card-hover group"
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#fef7f0' }}
                  >
                    <span className="text-2xl text-primary">
                      {category.icon === 'brick' && <Box className="w-7 h-7" />}
                      {category.icon === 'zap' && <Box className="w-7 h-7" />}
                      {category.icon === 'cog' && <Box className="w-7 h-7" />}
                      {category.icon === 'wifi' && <Box className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">{category.labelSw}</p>
                  <Button variant="outline" className="w-full" style={{ borderColor: '#ea6d32', color: '#ea6d32' }}>
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
          <div className="page-header text-center">
            <h2 className="page-title">{t('construction.labour')}</h2>
            <p className="page-subtitle">Find skilled professionals for every construction trade</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {labourCategories.slice(0, 4).map(([key, category]) => (
              <Link
                key={key}
                to={`${ROUTES.CONSTRUCTION_LABOUR}?category=${key}`}
                className="card-hover group"
              >
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: '#f0f0f5' }}
                  >
                    <span className="text-2xl text-secondary">
                      {category.icon === 'layers' && <Box className="w-7 h-7" />}
                      {category.icon === 'grid' && <Box className="w-7 h-7" />}
                      {category.icon === 'box' && <Box className="w-7 h-7" />}
                      {category.icon === 'wrench' && <Hammer className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">{category.labelSw}</p>
                  <Button variant="outline" className="w-full" style={{ borderColor: '#1a1a2e', color: '#1a1a2e' }}>
                    {t('common.viewAll')}
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="page-title">Materials ready to order</h2>
              <p className="page-subtitle">Demo inventory from verified suppliers across Tanzania</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary"><ShoppingCart className="w-5 h-5" /> {cartCount} items in cart</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="h-full flex flex-col">
                <CardMedia src={product.image} alt={product.name} aspectRatio="16/10" />
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2"><Badge variant="secondary">{product.grade}</Badge><span className="text-sm flex items-center gap-1 text-warning"><Star className="w-4 h-4 fill-current" />{product.rating}</span></div>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-text-secondary mb-1">{product.supplier}</p>
                  <p className="text-xs text-text-muted mb-4">{product.location} · {product.availableQuantity.toLocaleString()} {product.unit}s available</p>
                  <div className="mt-auto flex items-center justify-between gap-3"><div><span className="font-bold text-primary">TZS {product.price.toLocaleString()}</span><span className="text-xs text-text-muted"> / {product.unit}</span></div><Button size="sm" onClick={() => setCartCount((count) => count + 1)}><ShoppingCart className="w-4 h-4" /></Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Why Choose Our Marketplace?</h2>
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
            Start Your Construction Project Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Order quality materials and hire skilled labour teams with transparent pricing and reliable delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.CONSTRUCTION_MATERIALS}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto px-8">
                Browse Materials
              </Button>
            </Link>
            <Link to={ROUTES.CONSTRUCTION_POST_JOB}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8">
                Post a Labour Job
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};