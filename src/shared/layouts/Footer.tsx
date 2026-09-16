import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { ROUTES } from '../../shared/constants';
import { SERVICE_CATEGORIES } from '../../types';

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const Footer = () => {
  const { t } = useI18n();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
    { icon: TikTokIcon, href: 'https://tiktok.com/@ujenzi.25_group', label: 'TikTok' },
  ];

  const contactInfo = [
    { icon: MapPin, text: 'Arusha & Mwanza, Tanzania' },
    { icon: Phone, text: '+255 767 241 209' },
    { icon: Phone, text: '+255 688 081 717' },
    { icon: Mail, text: 'info@ujenzi25.com' },
    { icon: Mail, text: 'ujenzi25architect@gmail.com' },
    { icon: Clock, text: 'Mon-Fri 8:00-18:00, Sat 9:00-14:00' },
  ];

  const quickLinks = [
    { label: t('footer.quickLinks'), children: [
      { label: t('nav.home'), path: ROUTES.HOME },
      { label: t('nav.about'), path: ROUTES.ABOUT },
      { label: t('nav.contact'), path: ROUTES.CONTACT },
      { label: t('footer.careers'), path: ROUTES.CAREERS },
      { label: t('footer.faq'), path: '/faq' },
    ]},
    { label: t('footer.services'), children: SERVICE_CATEGORIES.map(cat => ({
      label: cat.name,
      path: `/${cat.slug}`,
    }))},
    { label: t('footer.resources'), children: [
      { label: t('nav.portfolio'), path: ROUTES.PORTFOLIO },
      { label: t('nav.blog'), path: ROUTES.BLOG },
      { label: t('footer.privacyPolicy'), path: '/privacy' },
      { label: t('footer.termsOfService'), path: '/terms' },
      { label: t('footer.cookiePolicy'), path: '/cookies' },
    ]},
  ];

  return (
    <footer className="bg-secondary text-white" role="contentinfo">
      <div className="container py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-3 mb-6" aria-label={t('common.appName')}>
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white/20">
                <img src="/assets/u25-logo.png" alt="Ujenzi 25" className="h-12 w-auto object-contain" />
              </div>
              <span className="font-bold text-3xl">{t('common.appName')}</span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed mb-6 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.contactInfo')}</h3>
            <address className="not-italic space-y-3 text-gray-400">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </address>
          </div>

          {/* Quick Links - Column 1 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{quickLinks[0].label}</h3>
            <nav>
              <ul className="space-y-2">
                {quickLinks[0].children.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{quickLinks[1].label}</h3>
            <nav>
              <ul className="space-y-2">
                {quickLinks[1].children.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{quickLinks[2].label}</h3>
            <nav>
              <ul className="space-y-2">
                {quickLinks[2].children.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};