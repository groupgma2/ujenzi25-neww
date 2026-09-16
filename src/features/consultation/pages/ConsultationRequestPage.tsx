import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Input, Select, Textarea } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { consultationApi } from '../../../shared/api/client';
import { ROUTES } from '../../../shared/constants';
import { useI18n } from '../../../context/I18nContext';

const serviceOptions = [
  { value: 'architectural', label: 'Architectural Design' },
  { value: 'structural', label: 'Structural Design' },
  { value: 'services', label: 'Service Drawing (MEP)' },
  { value: 'boq', label: 'Bill of Quantities (BOQ)' },
  { value: 'other', label: 'Other / Not sure' },
];

const projectTypeOptions = [
  { value: 'residential', label: 'Residential House / Apartment' },
  { value: 'commercial', label: 'Commercial Building' },
  { value: 'villa', label: 'Villa / Bungalow' },
  { value: 'renovation', label: 'Renovation / Extension' },
  { value: 'industrial', label: 'Industrial / Workshop' },
  { value: 'other', label: 'Other' },
];

const budgetOptions = [
  { value: 'under-5m', label: 'Under TZS 5M' },
  { value: '5m-20m', label: 'TZS 5M - 20M' },
  { value: '20m-75m', label: 'TZS 20M - 75M' },
  { value: '75m-250m', label: 'TZS 75M - 250M' },
  { value: '250m-plus', label: 'TZS 250M+' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const timelineOptions = [
  { value: 'urgent', label: 'Urgent (within 2 weeks)' },
  { value: '1-2-months', label: '1 - 2 months' },
  { value: '2-4-months', label: '2 - 4 months' },
  { value: '4-plus-months', label: '4+ months' },
  { value: 'flexible', label: 'Flexible' },
];

const serviceGuidance: Record<string, string> = {
  architectural: 'Example: 3-bedroom house, duplex, office block, hotel, façade idea, room layout, kitchen, parking, style inspiration, site condition, orientation.',
  structural: 'Example: beam sizes, slab thickness, foundation type, column arrangement, wall loading, site soil, floor levels, expected number of floors.',
  services: 'Example: electrical layout, plumbing, water supply, drainage, HVAC, generator, solar, sewer connection, restroom arrangement.',
  boq: 'Example: material quantities, specification of finishes, walling, concrete, roofing, windows, doors, electrical fittings, plumbing items, scope of work.',
  other: 'Example: mixed scope, feasibility study, concept review, design package, permit support, or a combination of services.',
};

export const ConsultationRequestPage = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('type') || 'architectural';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: initialService,
    projectType: '',
    projectLocation: '',
    budgetRange: '',
    timeline: '',
    projectBrief: '',
    needDetails: '',
    inspiration: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const serviceOptions = [
    { value: 'architectural', label: t('consultation.options.architectural') },
    { value: 'structural', label: t('consultation.options.structural') },
    { value: 'services', label: t('consultation.options.services') },
    { value: 'boq', label: t('consultation.options.boq') },
    { value: 'other', label: t('consultation.options.other') },
  ];

  const projectTypeOptions = [
    { value: 'residential', label: t('consultation.projectTypes.residential') },
    { value: 'commercial', label: t('consultation.projectTypes.commercial') },
    { value: 'villa', label: t('consultation.projectTypes.villa') },
    { value: 'renovation', label: t('consultation.projectTypes.renovation') },
    { value: 'industrial', label: t('consultation.projectTypes.industrial') },
    { value: 'other', label: t('consultation.projectTypes.other') },
  ];

  const budgetOptions = [
    { value: 'under-5m', label: t('consultation.budgetOptions.under5m') },
    { value: '5m-20m', label: t('consultation.budgetOptions.5to20m') },
    { value: '20m-75m', label: t('consultation.budgetOptions.20to75m') },
    { value: '75m-250m', label: t('consultation.budgetOptions.75to250m') },
    { value: '250m-plus', label: t('consultation.budgetOptions.250mPlus') },
    { value: 'not-sure', label: t('consultation.budgetOptions.notSure') },
  ];

  const timelineOptions = [
    { value: 'urgent', label: t('consultation.timelineOptions.urgent') },
    { value: '1-2-months', label: t('consultation.timelineOptions.oneToTwoMonths') },
    { value: '2-4-months', label: t('consultation.timelineOptions.twoToFourMonths') },
    { value: '4-plus-months', label: t('consultation.timelineOptions.fourPlusMonths') },
    { value: 'flexible', label: t('consultation.timelineOptions.flexible') },
  ];

  const currentGuide = useMemo(() => {
    const guide = t(`consultation.guides.${formData.serviceType}`) || t(`consultation.guides.${formData.serviceType}` as any) || '';
    return guide || serviceGuidance[formData.serviceType] || serviceGuidance.other;
  }, [formData.serviceType, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const validate = () => {
    if (!formData.fullName.trim()) return t('validation.requiredName') || 'Tafadhali ingiza jina lako.';
    if (!formData.email.trim()) return t('validation.requiredEmail') || 'Tafadhali ingiza barua pepe.';
    if (!formData.phone.trim()) return t('validation.requiredPhone') || 'Tafadhali ingiza nambari ya simu.';
    if (!formData.projectBrief.trim()) return t('validation.requiredProjectBrief') || 'Tafadhali taja muhtasari mfupi wa mradi.';
    if (!formData.needDetails.trim()) return t('validation.requiredNeedDetails') || 'Tafadhali elezea hasa unachotaka tufanye.';
    if (!formData.budgetRange) return t('validation.requiredBudget') || 'Tafadhali chagua kipimo cha bajeti.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        files: files.map((file) => file.name),
      };

      const res = await consultationApi.createRequest(payload);
      if (res.error) throw new Error(res.error.message || 'Failed to create request');
      const requestId = res.data?.id || res.data?.request?.id;

      if (files.length && requestId) {
        await consultationApi.uploadFiles(requestId, files);
      }

      navigate(ROUTES.CONSULTATION_MY_REQUESTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <PageHero
        tone={HERO_TONES.primary}
        eyebrow={t('consultation.requestConsultation')}
        title={t('consultation.title')}
        subtitle={t('consultation.subtitle')}
        image={{ src: '/images/hero/consultation.webp', alt: t('consultation.title') }}
      />

      <section className="section py-12 sm:py-16">
        <div className="container max-w-4xl">
          <Card padding="lg" className="bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
              <p className="font-semibold text-primary mb-1">{t('consultation.requestConsultation')}</p>
              <p className="text-sm text-text-secondary">
                {t('consultation.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('consultation.contactFullName') || t('auth.fullName')}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('auth.fullName') || 'e.g. Amina Hassan'}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Select
                  label={t('consultation.serviceType') || 'Service type'}
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  options={serviceOptions}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('consultation.contactEmail') || t('auth.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('auth.email') || 'you@example.com'}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label={t('consultation.contactPhone') || t('auth.phone')}
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('auth.phone') || '+255 7xx xxx xxx'}
                  required
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('consultation.projectType') || 'Project type'}
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  options={projectTypeOptions}
                  placeholder={t('common.choose')}
                />
                <Input
                  label={t('consultation.projectLocation') || 'Project location'}
                  name="projectLocation"
                  value={formData.projectLocation}
                  onChange={handleChange}
                  placeholder={t('consultation.projectLocation') || 'e.g. Dar es Salaam, Arusha, etc.'}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('consultation.budgetRange') || 'Budget range'}
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  options={budgetOptions}
                  placeholder={t('consultation.budgetRange')}
                  required
                />
                <Select
                  label={t('consultation.timeline') || 'Project timeline'}
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  options={timelineOptions}
                  placeholder={t('consultation.timeline')}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-sm mb-2">{t('consultation.guidanceTitle') || 'How we interpret your selected service'}</p>
                <p className="text-sm text-text-secondary">{currentGuide}</p>
              </div>

              <Textarea
                label={t('consultation.projectBrief') || 'Short project summary'}
                name="projectBrief"
                value={formData.projectBrief}
                onChange={handleChange}
                placeholder={t('consultation.projectBrief') || ''}
                required
                helperText={t('consultation.projectBrief') || 'This helps us understand whether you need concept design, detailed design, permit-ready drawings, or BOQ.'}
              />

              <Textarea
                label={t('consultation.needDetails') || 'What exactly do you need us to do?'}
                name="needDetails"
                value={formData.needDetails}
                onChange={handleChange}
                placeholder={t('consultation.needDetails') || ''}
                required
                helperText={t('consultation.needDetails') || 'Be as specific as possible: number of rooms, floors, materials, finish level, required drawings, site conditions, and expected deliverables.'}
              />

              <Textarea
                label={t('consultation.inspiration') || 'Inspiration or reference examples'}
                name="inspiration"
                value={formData.inspiration}
                onChange={handleChange}
                placeholder={t('consultation.inspiration') || ''}
                helperText={t('consultation.referenceFilesHelper') || 'If you have a sketch, photo, or website design you like, upload it below or describe it in text. This helps us match your preferred style.'}
              />

              <div>
                <label className="block text-sm font-medium mb-2">{t('consultation.referenceFilesLabel') || 'Reference files (optional but recommended)'}</label>
                <input type="file" multiple onChange={handleFiles} className="block w-full" />
                <p className="mt-1.5 text-sm text-text-muted">{t('consultation.referenceFilesHelper') || 'Upload sketches, site photos, floor plan images, surveys, or any inspiration material.'}</p>
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <div className="flex items-center gap-3 flex-wrap">
                <Button type="submit" loading={loading}>
                  {t('consultation.submitRequest') || 'Send Request'}
                </Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.CONSULTATION)}>
                  {t('common.back')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};
