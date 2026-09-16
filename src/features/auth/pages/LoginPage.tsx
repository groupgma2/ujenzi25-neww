import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card } from '../../../shared/ui/Card';
import { ROUTES } from '../../../shared/constants';

export const LoginPage = () => {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD_CLIENT;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }
    if (!formData.password) {
      newErrors.password = t('validation.required');
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
      await login(formData.email, formData.password, formData.rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.unauthorized'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
            <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.login')}</h1>
            <p className="mt-3 max-w-sm text-sm text-blue-100 sm:text-base">
              {t('auth.welcome') || 'Fungua akaunti yako na uanze kupanga mradi wako kwa haraka.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t('auth.login')}</p>
              <h2 className="mt-2 text-3xl font-bold text-text">Karibu tena</h2>
            </div>

            <Card padding="lg" className="border border-border shadow-sm">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700" role="alert">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div className="relative">
                  <Input
                    label={t('auth.password')}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="********"
                    autoComplete="current-password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">{t('auth.rememberMe')}</span>
                  </label>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <Button type="submit" fullWidth loading={isLoading} className="mt-2">
                  {t('auth.signIn')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-text-secondary">
                  {t('auth.noAccount')}{' '}
                  <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:text-primary-dark">
                    {t('auth.signUp')}
                  </Link>
                </p>
              </div>
            </Card>

            <div className="mt-6 text-center text-sm text-text-muted">
              <p>{t('auth.continueAs')}</p>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                <Link
                  to={`${ROUTES.REGISTER}?role=client`}
                  className="inline-flex items-center rounded-full border border-primary/30 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-bg"
                >
                  {t('auth.roleClient')}
                </Link>
                <Link
                  to={`${ROUTES.REGISTER}?role=partner`}
                  className="inline-flex items-center rounded-full border border-primary/30 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-bg"
                >
                  {t('auth.rolePartner')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};