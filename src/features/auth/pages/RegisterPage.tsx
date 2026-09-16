import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card } from '../../../shared/ui/Card';
import { Select } from '../../../shared/ui/Input';
import { Checkbox } from '../../../shared/ui/Input';
import { ROUTES } from '../../../shared/constants';

const roleOptions = [
  { value: 'client', label: 'Client / Customer', description: 'I need construction, property or booking services' },
  { value: 'partner', label: 'Partner / Supplier', description: 'I provide materials, labour, property listings or accommodation' },
];

export const RegisterPage = () => {
  const { t } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'client';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultRole as 'client' | 'partner' | 'company',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('validation.required');
    }
    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }
    if (!formData.phone) {
      newErrors.phone = t('validation.required');
    } else if (!/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = t('validation.phone');
    }
    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.minLength', { min: 8 });
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('validation.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        agreeTerms: formData.agreeTerms,
      });

      const dashboardRoute =
        formData.role === 'partner' || formData.role === 'company'
          ? ROUTES.DASHBOARD_PARTNER
          : ROUTES.DASHBOARD_CLIENT;

      navigate(dashboardRoute, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', test: formData.password.length >= 8 },
    { label: 'Uppercase letter', test: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase letter', test: /[a-z]/.test(formData.password) },
    { label: 'Number', test: /[0-9]/.test(formData.password) },
    { label: 'Special character', test: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 px-4 py-10 sm:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-white/60 bg-white/60 shadow-[0_20px_80px_rgba(37,99,235,0.12)] backdrop-blur-sm md:grid-cols-[1.05fr_1.35fr]">
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-10 text-white sm:px-10">
          <Link to={ROUTES.HOME} className="mb-8 inline-flex items-center justify-center">
            <div className="flex h-80 w-80 items-center justify-center rounded-full border-4 border-white/30 bg-white p-3 shadow-[0_20px_60px_rgba(255,255,255,0.25)] sm:h-96 sm:w-96">
              <img src="/assets/u25-logo.png" alt="Ujenzi 25" className="h-48 w-48 object-contain sm:h-56 sm:w-56" />
            </div>
          </Link>

          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-blue-100">UJENZI 25</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.register')}</h1>
            <p className="mt-3 max-w-sm text-sm text-blue-100 sm:text-base">
              {t('auth.createAccount') || 'Jisajili leo na uanze kubuni, kujenga au kukodisha nyumba yako vizuri.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-6 text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t('auth.register')}</p>
              <h2 className="mt-2 text-3xl font-bold text-text">Unda akaunti yako</h2>
            </div>

            <Card padding="lg" className="border border-border shadow-sm">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700" role="alert">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('auth.fullName')}
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    leftIcon={<User className="w-5 h-5" />}
                  />
                  <Select
                    label={t('auth.role') || 'Role'}
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    error={errors.role}
                    options={roleOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                    required
                  />
                </div>

                <Input
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  leftIcon={<Mail className="w-5 h-5" />}
                />

                <Input
                  label={t('auth.phone')}
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+255 7XX XXX XXX"
                  autoComplete="tel"
                  required
                  leftIcon={<Phone className="w-5 h-5" />}
                />

                <div className="relative">
                  <Input
                    label={t('auth.password')}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="********"
                    autoComplete="new-password"
                    required
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle
                            className={`w-3.5 h-3.5 ${req.test ? 'text-green-500' : 'text-gray-300'}`}
                          />
                          <span className={`${req.test ? 'text-green-600' : 'text-gray-500'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label={t('auth.confirmPassword')}
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="********"
                    autoComplete="new-password"
                    required
                    leftIcon={<Lock className="w-5 h-5" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  label={
                    <>
                      {t('auth.agreeTerms')}{' '}
                      <Link to="/terms" className="text-primary hover:underline">{t('auth.termsOfService')}</Link>
                      {' '}{t('auth.and')}{' '}
                      <Link to="/privacy" className="text-primary hover:underline">{t('auth.privacyPolicy')}</Link>
                    </>
                  }
                />

                <Button type="submit" fullWidth loading={isLoading} className="mt-2">
                  {t('auth.signUp')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-text-secondary">
                  {t('auth.haveAccount')}{' '}
                  <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-dark">
                    {t('auth.signIn')}
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};