import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Bell, MessageSquare, ChevronDown, FileText, Hammer, Building, Home, Hotel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { Avatar } from '../ui/Badge';
import { Dropdown, type SelectOption } from '../ui/Dropdown';
import { ROUTES } from '../../shared/constants';
import { STORAGE_KEYS } from '../../shared/constants';

export const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const serviceItems = [
    { path: ROUTES.CONSULTATION, label: t('nav.consultation'), icon: <FileText className="w-4 h-4" /> },
    { path: ROUTES.CONSTRUCTION, label: t('nav.construction'), icon: <Hammer className="w-4 h-4" /> },
    { path: ROUTES.REAL_ESTATE, label: t('nav.realEstate'), icon: <Building className="w-4 h-4" /> },
    { path: ROUTES.RENTAL, label: t('nav.rental'), icon: <Home className="w-4 h-4" /> },
    { path: ROUTES.HOTELS, label: t('nav.hotels'), icon: <Hotel className="w-4 h-4" /> },
  ];

  const mainItems = [
    { path: ROUTES.HOME, label: t('nav.home') },
    { path: ROUTES.PORTFOLIO, label: t('nav.portfolio') },
    { path: ROUTES.BLOG, label: t('nav.blog') },
    { path: ROUTES.ABOUT, label: t('nav.about') },
    { path: ROUTES.CONTACT, label: t('nav.contact') },
  ];

  const isServicePage = serviceItems.some((s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/'));

  const userMenuOptions: SelectOption[] = [
    { value: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { value: 'profile', label: t('nav.profile'), icon: <User className="w-4 h-4" /> },
    { value: 'messages', label: t('nav.messages'), icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'notifications', label: t('nav.notifications'), icon: <Bell className="w-4 h-4" /> },
    { value: 'settings', label: t('nav.settings'), icon: null },
    { value: 'logout', label: t('nav.logout'), icon: <LogOut className="w-4 h-4" /> },
  ];

  const handleUserMenuChange = (value: string) => {
    setUserMenuOpen(false);
    switch (value) {
      case 'dashboard':
        window.location.href = hasRole('admin') ? ROUTES.DASHBOARD_ADMIN : hasRole('company') ? ROUTES.DASHBOARD_STAFF : hasRole('partner') ? ROUTES.DASHBOARD_PARTNER : ROUTES.DASHBOARD_CLIENT;
        break;
      case 'profile':
        window.location.href = ROUTES.PROFILE;
        break;
      case 'messages':
        window.location.href = '/dashboard/messages';
        break;
      case 'notifications':
        window.location.href = '/dashboard/notifications';
        break;
      case 'settings':
        window.location.href = '/dashboard/settings';
        break;
      case 'logout':
        logout();
        break;
    }
  };

  const languageOptions: SelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Kiswahili' },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border">
      <nav className="container" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3" aria-label={t('common.appName')}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">U25</span>
            </div>
            <span className="font-bold text-2xl text-text hidden sm:block">{t('common.appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {mainItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-bg text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isServicePage
                    ? 'bg-primary-bg text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-gray-100'
                }`}
              >
                {t('nav.services')}
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setServicesOpen(false)} aria-hidden="true" />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-xl animate-scale-in">
                    {serviceItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setServicesOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? 'bg-primary-bg text-primary'
                            : 'text-text-secondary hover:bg-gray-50 hover:text-text'
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-bg text-primary">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <Dropdown
              options={languageOptions}
              value={language}
              onChange={(v) => setLanguage(v as 'en' | 'sw')}
              placeholder={language === 'en' ? 'EN' : 'SW'}
              className="w-28"
            />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to={ROUTES.NOTIFICATIONS}
                  className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-colors relative"
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <Link
                  to={ROUTES.MESSAGES}
                  className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-colors relative"
                  aria-label={t('nav.messages')}
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <Avatar
                      src={user.avatar}
                      name={user.fullName}
                      size="sm"
                    />
                    <span className="hidden lg:block text-sm font-medium text-text">{user.fullName}</span>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-border shadow-lg rounded-xl overflow-hidden z-50">
                      {userMenuOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleUserMenuChange(option.value)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {option.icon && <span>{option.icon}</span>}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.LOGIN} className="btn btn-ghost btn-sm">
                  {t('nav.login')}
                </Link>
                <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white animate-slide-down">
          <div className="container py-4 space-y-2">
            {mainItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-bg text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{t('nav.services')}</p>
            {serviceItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-bg text-primary'
                    : 'text-text-secondary hover:text-text hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-primary">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{t('common.language')}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
                  className="input py-2 w-28"
                >
                  <option value="en">EN</option>
                  <option value="sw">SW</option>
                </select>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text hover:bg-gray-100 transition-colors"
              >
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              {user ? (
                <>
                  <Link
                    to={hasRole('admin') ? ROUTES.DASHBOARD_ADMIN : hasRole('company') ? ROUTES.DASHBOARD_STAFF : hasRole('partner') ? ROUTES.DASHBOARD_PARTNER : ROUTES.DASHBOARD_CLIENT}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-error hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to={ROUTES.LOGIN} className="btn btn-outline btn-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.login')}
                  </Link>
                  <Link to={ROUTES.REGISTER} className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};