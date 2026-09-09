import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Users, Award, Shield, ArrowRight, Building, Home, Hotel, Hammer, FileText } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { PageHero, HERO_TONES } from '../shared/ui/PageHero';
import { Card } from '../shared/ui/Card';
import { SERVICE_CATEGORIES } from '../types';
import { ROUTES } from '../shared/constants';

const values = [
  { icon: Target, title: 'Integrity', description: 'We operate with honesty and transparency in every interaction' },
  { icon: Eye, title: 'Excellence', description: 'Delivering quality that exceeds expectations on every project' },
  { icon: Heart, title: 'Client First', description: 'Your success is our success - we put your needs first' },
  { icon: Users, title: 'Collaboration', description: 'Working together with clients, partners, and communities' },
  { icon: Shield, title: 'Safety', description: 'Prioritizing safety in every aspect of our operations' },
  { icon: Award, title: 'Innovation', description: 'Embracing new technologies and methods for better results' },
];

const team = [
  { name: '', role: 'Founder & CEO', bio: 'Magessa R Mashauri — Civil engineer with 20+ years experience in major infrastructure projects across East Africa.', image: '/images/team/ceo.jpg' },
  { name: '', role: 'Chief Architect', bio: 'Arch. Fatima Hassan — Award-winning architect specializing in sustainable residential and commercial design.', image: '/images/team/architect.jpg' },
  { name: '', role: 'Head of Engineering', bio: 'Eng. Grace Mlay — Structural engineer expert in high-rise buildings and complex structural systems.', image: '/images/team/engineer.jpg' },
  { name: '', role: 'Director of Operations', bio: 'Peter Kilonzo — Operations leader with extensive experience in project management and client relations.', image: '/images/team/operations.jpg' },
];



export const AboutPage = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
            <PageHero
        tone={HERO_TONES.secondary}
        eyebrow="Building Tanzania's Future"
        title={t('about.title')}
        subtitle={t('about.subtitle')}
        image={{ src: '/images/hero/about.webp', alt: 'UJENZI 25 construction and engineering team' }}
        primaryCta={{ label: 'Work With Us', to: ROUTES.CONTACT }}
      />

      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">{t('about.mission')}</h2>
            <p className="page-subtitle max-w-3xl mx-auto">
              To provide a trusted, integrated digital platform that connects clients with verified construction, real estate, and hospitality professionals across Tanzania, making quality services accessible, transparent, and efficient.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Building, title: 'One-Stop Platform', desc: 'Access all construction, property & hospitality services in one place' },
              { icon: Home, title: 'Verified Network', desc: 'Every professional and listing verified for quality and trust' },
              { icon: Hotel, title: 'Local Expertise', desc: 'Deep knowledge of Tanzanian regulations, markets, and communities' },
            ].map((item, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center gradient-primary">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">{t('about.values')}</h2>
            <p className="page-subtitle">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} hover padding="lg">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center gradient-primary">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-text-secondary">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">{t('about.team')}</h2>
            <p className="page-subtitle">Experienced professionals dedicated to your success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} hover padding="lg" className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl">
                    {member.role.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-text-muted">{member.role}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <p className="text-text-secondary text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Our Services</h2>
            <p className="page-subtitle">Five interconnected pillars for complete solutions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SERVICE_CATEGORIES.map((category) => (
              <Link key={category.id} to={`/${category.slug}`} className="card-hover group">
                <Card padding="lg" className="text-center h-full">
                  <div
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <span className="text-2xl" style={{ color: category.color }}>
                      {category.icon === 'drafting' && <FileText className="w-7 h-7" />}
                      {category.icon === 'hammer' && <Hammer className="w-7 h-7" />}
                      {category.icon === 'building' && <Building className="w-7 h-7" />}
                      {category.icon === 'home' && <Home className="w-7 h-7" />}
                      {category.icon === 'bed' && <Hotel className="w-7 h-7" />}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-secondary">{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're planning a construction project, looking for property, or need accommodation, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto px-8">
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={ROUTES.CAREERS}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto px-8">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};