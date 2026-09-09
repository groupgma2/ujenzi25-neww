import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, MapPin as MapPinIcon, CheckCircle } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { PageHero, HERO_TONES } from '../shared/ui/PageHero';
import { Input, Textarea } from '../shared/ui/Input';
import { Card, CardContent } from '../shared/ui/Card';
import { ROUTES } from '../shared/constants';

const contactInfo = [
  { icon: MapPinIcon, title: 'Our Locations', details: 'Arusha & Mwanza, Tanzania' },
  { icon: Phone, title: 'Call Us', details: '+255 767 241 209', href: 'tel:+255767241209' },
  { icon: Phone, title: 'Call Us', details: '+255 688 081 717', href: 'tel:+255688081717' },
  { icon: Mail, title: 'Email Us', details: 'info@ujenzi25.com', href: 'mailto:info@ujenzi25.com' },
  { icon: Mail, title: 'Email Us', details: 'ujenzi25architect@gmail.com', href: 'mailto:ujenzi25architect@gmail.com' },
  { icon: MessageSquare, title: 'TikTok', details: '@ujenzi.25_group', href: 'https://tiktok.com/@ujenzi.25_group' },
  { icon: Clock, title: 'Working Hours', details: 'Mon-Fri: 8:00-18:00, Sat: 9:00-14:00' },
];

const offices = [
  { city: 'Arusha', address: 'UJENZI 25 Arusha Office, Tanzania', phone: '+255 767 241 209' },
  { city: 'Mwanza', address: 'UJENZI 25 Mwanza Office, Tanzania', phone: '+255 688 081 717' },
];

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'consultation', label: 'Consultation Request' },
  { value: 'construction', label: 'Construction Materials/Labour' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'rental', label: 'Rental Housing' },
  { value: 'hotels', label: 'Hotels & Airbnb' },
  { value: 'partnership', label: 'Partnership Opportunities' },
  { value: 'careers', label: 'Careers' },
  { value: 'support', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
];

export const ContactPage = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
    if (!formData.email) newErrors.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.email');
    if (!formData.phone) newErrors.phone = t('validation.required');
    else if (!/^\+?[0-9\s-]{10,}$/.test(formData.phone)) newErrors.phone = t('validation.phone');
    if (!formData.subject) newErrors.subject = t('validation.required');
    if (!formData.message.trim()) newErrors.message = t('validation.required');
    else if (formData.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen">
            <PageHero
        tone={HERO_TONES.secondary}
        eyebrow="Get In Touch"
        title={t('contact.title')}
        subtitle={t('contact.subtitle')}
        image={{ src: '/images/hero/contact.webp', alt: 'Customer support and communication' }}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {contactInfo.map((item, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-text-secondary hover:text-primary transition-colors">
                    {item.details}
                  </a>
                ) : (
                  <p className="text-text-secondary">{item.details}</p>
                )}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card padding="lg">
              <CardContent>
                <h2 className="text-2xl font-bold text-text mb-6">{t('contact.sendMessage')}</h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-700" role="alert">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Message Sent Successfully!</p>
                      <p className="text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('contact.fullName')}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                      placeholder="John Doe"
                      required
                    />
                    <Input
                      label={t('contact.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('contact.phone')}
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="+255 7XX XXX XXX"
                      required
                    />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`input ${errors.subject ? 'input-error' : ''}`}
                      required
                    >
                      <option value="">{t('common.select')}</option>
                      {subjectOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <Textarea
                    label={t('contact.message')}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    placeholder="Describe your inquiry in detail..."
                    rows={5}
                    required
                  />
                  <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
                    {isSubmitting ? 'Sending...' : t('contact.send')}
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions & Offices */}
            <div className="space-y-6">
              <Card padding="lg">
                <CardContent>
                  <h3 className="text-xl font-bold text-text mb-6">{t('contact.quickActions') || 'Quick Actions'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to={ROUTES.CONSULTATION_REQUEST} className="btn btn-outline text-left justify-start">
                      <MessageSquare className="w-5 h-5" />
                      <span>{t('consultation.requestConsultation')}</span>
                    </Link>
                    <Link to={ROUTES.CONSTRUCTION_MATERIALS} className="btn btn-outline text-left justify-start">
                      <MapPin className="w-5 h-5" />
                      <span>{t('construction.browseMaterials')}</span>
                    </Link>
                    <Link to={ROUTES.REAL_ESTATE_LISTINGS} className="btn btn-outline text-left justify-start">
                      <MapPin className="w-5 h-5" />
                      <span>{t('realEstate.browseProperties')}</span>
                    </Link>
                    <Link to={ROUTES.RENTAL_LISTINGS} className="btn btn-outline text-left justify-start">
                      <MapPin className="w-5 h-5" />
                      <span>{t('rental.browseListings')}</span>
                    </Link>
                    <Link to={ROUTES.HOTELS_LISTINGS} className="btn btn-outline text-left justify-start">
                      <MapPin className="w-5 h-5" />
                      <span>{t('hotels.browseListings')}</span>
                    </Link>
                    <Link to={ROUTES.CAREERS} className="btn btn-outline text-left justify-start">
                      <MapPin className="w-5 h-5" />
                      <span>{t('footer.careers')}</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardContent>
                  <h3 className="text-xl font-bold text-text mb-6">{t('contact.branchOffices')}</h3>
                  <div className="space-y-4">
                    {offices.map((office, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50">
                        <h4 className="font-medium text-text">{office.city}</h4>
                        <p className="text-sm text-text-secondary mt-1">{office.address}</p>
                        <p className="text-sm text-text-muted mt-1">{office.phone}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prefer to Chat Directly?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with our team instantly via WhatsApp for quick questions and support.
          </p>
          <a href="https://wa.me/255767241209" target="_blank" rel="noopener noreferrer" className="btn btn-lg bg-white text-primary hover:bg-gray-100">
            <MessageSquare className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};