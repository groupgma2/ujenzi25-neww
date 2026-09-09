import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface PageHeroTone {
  from: string;
  to: string;
  glow: string;
}

export const HERO_TONES: Record<string, PageHeroTone> = {
  primary: { from: '#ea6d32', to: '#9a3f12', glow: 'rgba(255,183,135,0.45)' },
  secondary: { from: '#23233f', to: '#0f1220', glow: 'rgba(234,109,50,0.40)' },
  teal: { from: '#01829f', to: '#013f52', glow: 'rgba(108,216,245,0.42)' },
  green: { from: '#0d9d72', to: '#044d37', glow: 'rgba(95,224,182,0.40)' },
  amber: { from: '#c07f05', to: '#6e4700', glow: 'rgba(255,209,102,0.42)' },
  indigo: { from: '#4338ca', to: '#1e1b4b', glow: 'rgba(165,180,252,0.42)' },
};

export interface PageHeroStat {
  value: string;
  label: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  image?: { src: string; alt: string };
  stats?: PageHeroStat[];
  tone?: PageHeroTone;
  children?: React.ReactNode;
}

export const PageHero = ({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  stats,
  tone = HERO_TONES.primary,
  children,
}: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-[#0e1118] text-white">
      {/* Background: full-bleed photo when provided, brand gradient otherwise */}
      {image ? (
        <>
          <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d16]/95 via-[#0a0d16]/70 to-[#0a0d16]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16]/90 via-transparent to-[#0a0d16]/30" />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 88% 15%, ${tone.glow}, transparent 40%)` }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(125deg, ${tone.from} 0%, ${tone.to} 80%)` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 82% 10%, ${tone.glow}, transparent 42%)` }}
          />
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
              backgroundSize: '46px 46px',
            }}
          />
        </>
      )}
      <div className="pointer-events-none absolute -right-24 top-6 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-6 top-24 h-44 w-44 rounded-full border border-white/10" />

      {/* Content */}
      <div className="container relative flex min-h-[440px] items-center py-14 sm:min-h-[500px] lg:min-h-[560px] lg:py-20">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {eyebrow}
          </div>

          <h1 className="text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              {subtitle}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryCta && (
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-gray-100"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  to={secondaryCta.to}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/60 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}

          {children}

          {stats && (
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="border-l-2 border-white/25 pl-3">
                  <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs leading-snug text-white/70 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
