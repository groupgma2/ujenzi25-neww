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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">U25</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-text">{t('auth.login')}</h1>
          <p className="mt-2 text-text-secondary">{t('auth.welcome') || 'Welcome back to your account'}</p>
        </div>

        <Card padding="lg">
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
  );
};