import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, FileText, Building, Hammer, Bed, Hotel } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { ROUTES } from '../shared/constants';
import { SERVICE_CATEGORIES } from '../types';

export const NotFoundPage = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary/20">404</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-4">{t('errors.404')}</h1>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto">{t('errors.404Message')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to={ROUTES.HOME}>
            <Button size="lg">
              <Home className="w-5 h-5 mr-2" />
              {t('nav.home')}
            </Button>
          </Link>
          <Link to={ROUTES.CONTACT}>
            <Button size="lg" variant="outline">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('nav.contact')}
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-text mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={`/${category.slug}`}
                  className="p-4 rounded-xl bg-white border border-border hover:border-primary hover:bg-primary-bg/50 transition-colors text-center"
                >
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${category.color}15` }}>
                    <span style={{ color: category.color }}>
                      {category.icon === 'drafting' && <FileText className="w-5 h-5" />}
                      {category.icon === 'hammer' && <Hammer className="w-5 h-5" />}
                      {category.icon === 'building' && <Building className="w-5 h-5" />}
                      {category.icon === 'home' && <Bed className="w-5 h-5" />}
                      {category.icon === 'bed' && <Hotel className="w-5 h-5" />}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Or Search</h3>
            <form className="max-w-md mx-auto flex gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="search"
                placeholder="Search projects, properties, services..."
                className="input flex-1"
              />
              <Button type="submit"><Search className="w-5 h-5" /></Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};