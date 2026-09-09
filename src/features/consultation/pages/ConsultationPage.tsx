import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Box, Settings, Calculator, ArrowRight, Shield, Clock, Users, Award } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card } from '../../../shared/ui/Card';
import { DRAWING_TYPES } from '../../../shared/constants';
import { ROUTES } from '../../../shared/constants';

const drawingTypes = [
  {
    key: 'architectural',
    icon: FileText,
    color: '#ea6d32',
    bgColor: '#fef7f0',
  },
  {
    key: 'structural',
    icon: Box,
    color: '#1a1a2e',
    bgColor: '#f0f0f5',
  },
  {
    key: 'services',
    icon: Settings,
    color: '#00b4d8',
    bgColor: '#f0f9fc',
  },
  {
    key: 'boq',
    icon: Calculator,
    color: '#10b981',
    bgColor: '#f0fdf4',
  },
];

const processSteps = [
  { step: '01', title: 'Submit Request', description: 'Fill in project details and upload reference documents' },
  { step: '02', title: 'Expert Review', description: 'Our consultants review and provide a detailed quotation' },
  { step: '03', title: 'Approve & Pay', description: 'Accept the quote and make secure payment' },
  { step: '04', title: 'Delivery', description: 'Receive permit-ready drawings with revision support' },
];

const benefits = [
  { icon: Shield, title: 'Licensed Professionals', description: 'Registered engineers & architects' },
  { icon: Clock, title: 'Fast Turnaround', description: 'Quotes within 24-48 hours' },
  { icon: Users, title: 'Dedicated Support', description: 'Direct communication with your consultant' },
  { icon: Award, title: 'Permit-Ready', description: 'Drawings compliant with local regulations' },
];

export const ConsultationPage = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      {/* Hero */}
            <PageHero
        tone={HERO_TONES.primary}
        eyebrow="Professional Civil Works Consultation"
        title={t('consultation.title')}
        subtitle={t('consultation.subtitle')}
        primaryCta={{ label: t('consultation.requestConsultation'), to: ROUTES.CONSULTATION_REQUEST }}
        secondaryCta={{ label: t('consultation.myRequests'), to: ROUTES.CONSULTATION_MY_REQUESTS }}
        image={{ src: '/images/hero/consultation.webp', alt: 'Architectural consultation illustration' }}
      />

      {/* Drawing Types */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Our Consultation Services</h2>
            <p className="page-subtitle">Choose the service that matches your project needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {drawingTypes.map((type) => {
              const config = DRAWING_TYPES[type.key as keyof typeof DRAWING_TYPES];
              return (
                <Link
                  key={type.key}
                  to={`${ROUTES.CONSULTATION_REQUEST}?type=${type.key}`}
                  className="card-hover group h-full"
                >
                  <Card padding="lg" className="h-full flex flex-col">
                    <div
                      className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: type.bgColor }}
                    >
                      <type.icon className="w-7 h-7" style={{ color: type.color }} />
                    </div>
                    <h3 className="font-semibold text-lg text-center mb-2 group-hover:text-primary transition-colors">
                      {config.label}
                    </h3>
                    <p className="text-sm text-text-secondary text-center flex-1">{config.labelSw}</p>
                    <Button variant="outline" className="mt-4 w-full" style={{ borderColor: type.color, color: type.color }}>
                      {t('common.getStarted')}
                    </Button>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">How It Works</h2>
            <p className="page-subtitle">Simple, transparent process from request to delivery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <Card padding="lg" className="pt-10 text-center">
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Why Choose UJENZI 25 Consultation?</h2>
            <p className="page-subtitle">Trusted by hundreds of clients across Tanzania</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-text-secondary">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get professional architectural, structural, and services drawings with transparent pricing and expert support.
          </p>
          <Link to={ROUTES.CONSULTATION_REQUEST}>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8">
              Request Consultation Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};