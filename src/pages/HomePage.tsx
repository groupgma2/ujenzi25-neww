import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building, Home, Hotel, Hammer, FileText } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { SERVICE_CATEGORIES } from '../types';
import { ROUTES } from '../shared/constants';

export const HomePage = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white text-text">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Desktop & tablet: video (hidden on small screens) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/homepage-bg.jpg"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectPosition: 'center top' }}
          onLoadedMetadata={(e) => {
            try { (e.currentTarget as HTMLVideoElement).playbackRate = 1.5; } catch (err) { /* ignore */ }
          }}
          onError={() => console.warn('Hero video failed to load')}
        >
          <source src="/assets/homepage-hero.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

        {/* Mobile: use poster image to avoid cropping / heavy downloads */}
        <img
          src="/assets/homepage-bg.jpg"
          alt="Ujenzi 25 background"
          className="block sm:hidden absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark overlay: lighter on mobile, darker on desktop */}
        <div className="absolute inset-0 bg-black/20 sm:bg-black/35"></div>

        {/* Content */}
        <div className="relative z-10 container py-10 sm:py-16">

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
              {/* Left: Large logo + slogan */}
              <div className="flex-1 flex items-center gap-6">
                <div className="flex-shrink-0 hidden sm:flex h-32 w-32 items-center justify-center rounded-3xl bg-primary overflow-hidden shadow-2xl ring-4 ring-white/30">
                  <img src="/assets/u25-logo.png" alt="Ujenzi 25" className="h-24 w-auto object-contain" />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">{t('homepage.tagline')}</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                    {t('homepage.headline')}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm text-gray-200">
                    {t('homepage.description')}
                  </p>
                </div>
              </div>

              {/* Right: Quick start card */}
              <div className="mt-8 lg:mt-0 w-full lg:w-[33%]">
                <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5 shadow-lg sm:p-6">
                  <div className="mb-4 text-sm font-semibold text-orange-300">{t('homepage.quickStart')}</div>
                  <div className="space-y-3 text-sm text-gray-100">
                    <div className="rounded-2xl bg-white/5 p-3">1. {t('homepage.step1')}</div>
                    <div className="rounded-2xl bg-white/5 p-3">2. {t('homepage.step2')}</div>
                    <div className="rounded-2xl bg-white/5 p-3">3. {t('homepage.step3')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA buttons below for small screens */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={ROUTES.CONSULTATION_REQUEST}>
                <Button size="lg" className="w-full sm:w-auto px-6">
                  {t('homepage.cta1')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.PORTFOLIO}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 border-white text-white hover:bg-white/10">
                  {t('homepage.cta2')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SERVICE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/${category.slug}`}
                className="group rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <span style={{ color: category.color }}>
                    {category.icon === 'drafting' && <FileText className="h-5 w-5" />}
                    {category.icon === 'hammer' && <Hammer className="h-5 w-5" />}
                    {category.icon === 'building' && <Building className="h-5 w-5" />}
                    {category.icon === 'home' && <Home className="h-5 w-5" />}
                    {category.icon === 'bed' && <Hotel className="h-5 w-5" />}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text group-hover:text-primary">{category.name}</h3>
                <p className="mt-1 text-[11px] leading-snug text-text-secondary line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('homepage.easyWay')}</h2>
            <p className="mt-2 text-text-secondary">{t('homepage.easyWayDesc')}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-gray-50 p-5 text-center">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">1</div>
              <h3 className="font-semibold">{t('homepage.step1')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('homepage.step1Desc')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 p-5 text-center">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">2</div>
              <h3 className="font-semibold">{t('homepage.step2')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('homepage.step2Desc')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 p-5 text-center">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">3</div>
              <h3 className="font-semibold">{t('homepage.step3')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('homepage.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('homepage.readyToStart')}</h2>
          <p className="mt-3 text-text-secondary">{t('homepage.readyToStartDesc')}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={ROUTES.CONSULTATION_REQUEST}>
              <Button size="lg" className="w-full sm:w-auto px-8">
                {t('homepage.readyToStart')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                {t('nav.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};