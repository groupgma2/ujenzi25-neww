import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, User, MessageSquare, Bell, Settings, LogOut, Building, Home, Briefcase, FileText, BarChart, Users, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { Avatar } from '../../../shared/ui/Badge';
import { ROUTES } from '../../../shared/constants';

const navigation = [
  { name: 'overview', href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { name: 'requests', href: '/dashboard/client/requests', icon: FileText, label: 'My Requests', roles: ['client'] },
  { name: 'orders', href: '/dashboard/client/orders', icon: Building, label: 'My Orders', roles: ['client'] },
  { name: 'bookings', href: '/dashboard/client/bookings', icon: Home, label: 'My Bookings', roles: ['client'] },
  { name: 'listings', href: '/dashboard/partner/listings', icon: Briefcase, label: 'My Listings', roles: ['partner'] },
  { name: 'properties', href: '/dashboard/partner/properties', icon: Building, label: 'Properties', roles: ['partner'] },
  { name: 'analytics', href: '/dashboard/admin/analytics', icon: BarChart, label: 'Analytics', roles: ['admin', 'company'] },
  { name: 'users', href: '/dashboard/admin/users', icon: Users, label: 'User Management', roles: ['admin'] },
  { name: 'payments', href: '/dashboard/payments', icon: CreditCard, label: 'Payments', roles: ['client', 'partner', 'company'] },
];

const profileNavigation = [
  { name: 'profile', href: ROUTES.PROFILE, icon: User, label: 'Profile' },
  { name: 'messages', href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { name: 'notifications', href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { name: 'settings', href: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
];

export const DashboardLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleTone = {
    client: {
      accent: 'text-primary',
      badge: 'bg-primary-bg text-primary border-primary-border',
      active: 'bg-primary-bg text-primary border border-primary-border',
    },
    partner: {
      accent: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    admin: {
      accent: 'text-violet-600',
      badge: 'bg-violet-50 text-violet-700 border border-violet-200',
      active: 'bg-violet-50 text-violet-700 border border-violet-200',
    },
    company: {
      accent: 'text-sky-600',
      badge: 'bg-sky-50 text-sky-700 border border-sky-200',
      active: 'bg-sky-50 text-sky-700 border border-sky-200',
    },
  };

  const currentRole = (user?.role || 'client') as keyof typeof roleTone;
  const tone = roleTone[currentRole] || roleTone.client;

  const filteredNav = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => hasRole(role as any));
  });

  const getActiveIcon = (item: typeof navigation[0]) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    return isActive ? tone.active : 'text-text-secondary hover:bg-gray-100 hover:text-text';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">U25</span>
              </div>
              <span className="font-bold text-xl text-text">UJENZI 25</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${getActiveIcon(item)}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{t(`dashboard.${item.label.toLowerCase()}`) || item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Account
              </p>
              {profileNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${getActiveIcon(item)}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{t(`nav.${item.name}`) || item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={user?.avatar}
                name={user?.fullName || 'User'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{user?.fullName}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-error hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                  {user?.role || 'client'}
                </span>
                <h1 className="text-lg font-semibold text-text">
                  {t(`dashboard.${location.pathname.split('/').pop() || 'overview'}`) || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-text-secondary">
                <span className={`font-medium ${tone.accent}`}>{user?.fullName}</span>
              </div>
              <Avatar
                src={user?.avatar}
                name={user?.fullName || 'User'}
                size="sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};