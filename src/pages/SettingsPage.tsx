import React, { useState } from 'react';
import { Sun, Moon, Monitor, Bell, Shield, CreditCard, Trash2, Download, Key, User, Mail, Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { Input, Select } from '../shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/Card';


const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
];

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const currencyOptions = [
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
  { value: 'USD', label: 'US Dollar (USD)' },
];

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system' | string>('system');
  const [currency, setCurrency] = useState('TZS');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });
  const [activeSection, setActiveSection] = useState<'general' | 'appearance' | 'notifications' | 'payments' | 'security' | 'data' | string>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const sections = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  const handleSave = async () => {
    setSaveStatus('idle');
    try {
      await updateProfile({
        // Only pass valid User properties
      });
      // Save preferences to localStorage
      localStorage.setItem('ujenzi25_theme', theme);
      localStorage.setItem('ujenzi25_currency', currency);
      localStorage.setItem('ujenzi25_notifications', JSON.stringify(notifications));
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">{t('nav.settings')}</h1>
        <Button onClick={handleSave} variant="primary">
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>

      {saveStatus === 'success' && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-700" role="alert">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>Settings saved successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700" role="alert">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>Failed to save settings. Please try again.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:sticky lg:top-24">
          <CardContent className="p-2">
            <nav className="space-y-1" aria-label="Settings sections">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-bg text-primary'
                        : 'text-text-secondary hover:bg-gray-100 hover:text-text'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General */}
          {activeSection === 'general' && (
            <>
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" defaultValue={user?.fullName} disabled />
                    <Input label="Email" type="email" defaultValue={user?.email} disabled />
                    <Input label="Phone" type="tel" defaultValue={user?.phone} />
                    <Select
                      label="Language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
                      options={languageOptions}
                    />
                    <Select
                      label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      options={currencyOptions}
                    />
                    <Input label="Timezone" defaultValue="Africa/Dar_es_Salaam" />
                  </div>
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Street Address" placeholder="123 Main Street" />
                    <Input label="Ward/District" placeholder="Kinondoni" />
                    <Input label="Region" placeholder="Dar es Salaam" />
                    <Input label="Country" defaultValue="Tanzania" disabled />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Theme & Display</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-medium text-text mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            theme === option.value
                              ? 'border-primary bg-primary-bg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: theme === option.value ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                          <p className="font-medium">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-text mb-4">Font Size</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          size === 'medium' ? 'border-primary bg-primary-bg' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium capitalize">{size}</p>
                        <p className={`text-text-secondary mt-1`} style={{ fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem' }}>
                          Sample text
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-text mb-4">Density</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['compact', 'comfortable', 'spacious'].map((density) => (
                      <button
                        key={density}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          density === 'comfortable' ? 'border-primary bg-primary-bg' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium capitalize">{density}</p>
                        <p className="text-sm text-text-secondary mt-1">Preview</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {[
                  { title: 'Email Notifications', icon: Mail, items: [
                    { key: 'email', label: 'All email notifications', description: 'Master toggle for email notifications' },
                    { key: 'emailMessages', label: 'New messages', description: 'When you receive a new message' },
                    { key: 'emailOrders', label: 'Order updates', description: 'Status changes on your orders' },
                    { key: 'emailBookings', label: 'Booking confirmations', description: 'Hotel and rental booking updates' },
                    { key: 'emailPayments', label: 'Payment receipts', description: 'Confirmation of payments made/received' },
                    { key: 'emailMarketing', label: 'Marketing & promotions', description: 'News, offers, and updates from UJENZI 25' },
                  ]},
                  { title: 'Push Notifications', icon: Bell, items: [
                    { key: 'push', label: 'All push notifications', description: 'Master toggle for push notifications' },
                    { key: 'pushMessages', label: 'New messages', description: 'Instant message alerts' },
                    { key: 'pushOrders', label: 'Order updates', description: 'Real-time order status changes' },
                    { key: 'pushReminders', label: 'Booking reminders', description: 'Check-in/check-out reminders' },
                  ]},
                  { title: 'SMS Notifications', icon: Phone, items: [
                    { key: 'sms', label: 'All SMS notifications', description: 'Master toggle for SMS notifications' },
                    { key: 'smsPayments', label: 'Payment confirmations', description: 'Critical payment alerts' },
                    { key: 'smsBookings', label: 'Booking confirmations', description: 'Booking status via SMS' },
                    { key: 'smsSecurity', label: 'Security alerts', description: 'Login alerts, password changes' },
                  ]},
                ].map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-3 mb-4">
                      <section.icon className="w-6 h-6 text-primary" />
                      <div>
                        <h4 className="font-medium text-text">{section.title}</h4>
                        <p className="text-sm text-text-secondary">Manage how you receive {section.title.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="space-y-3 ml-9">
                      {section.items.map((item) => (
                        <label key={item.key} className="flex items-start justify-between gap-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-text">{item.label}</p>
                            <p className="text-sm text-text-secondary">{item.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked={notifications[item.key as keyof typeof notifications] ?? true}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary mt-0.5"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payments */}
          {activeSection === 'payments' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary mb-6">Manage your preferred payment methods for quick checkout.</p>
                <div className="space-y-4">
                  {[
                    { id: 'mpesa', name: 'M-Pesa', icon: '📱', color: '#00a651', connected: true },
                    { id: 'tigo_pesa', name: 'Tigo Pesa', icon: '📱', color: '#0066cc', connected: false },
                    { id: 'airtel_money', name: 'Airtel Money', icon: '📱', color: '#e60000', connected: false },
                    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: '#1a1a2e', connected: false },
                    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: '#6366f1', connected: false },
                  ].map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${method.color}15` }}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-medium text-text">{method.name}</p>
                          <p className="text-sm text-text-secondary">{method.connected ? 'Connected' : 'Not connected'}</p>
                        </div>
                      </div>
                      <Button variant={method.connected ? 'outline' : 'primary'} size="sm">
                        {method.connected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Key className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium text-text">Password</h4>
                        <p className="text-sm text-text-secondary">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Shield className="w-8 h-8 text-success" />
                      <div>
                        <h4 className="font-medium text-text">Two-Factor Authentication</h4>
                        <p className="text-sm text-text-secondary">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <User className="w-8 h-8 text-accent" />
                      <div>
                        <h4 className="font-medium text-text">Active Sessions</h4>
                        <p className="text-sm text-text-secondary">Manage your logged-in devices</p>
                      </div>
                    </div>
                    <Button variant="ghost">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data & Privacy */}
          {activeSection === 'data' && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-medium text-text mb-4">Your Data</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full sm:w-auto justify-start gap-3">
                      <Download className="w-5 h-5" />
                      <span>Download My Data</span>
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto justify-start gap-3">
                      <Trash2 className="w-5 h-5 text-error" />
                      <span className="text-error">Delete Account</span>
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-medium text-text mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-text">Profile Visibility</p>
                        <p className="text-sm text-text-secondary">Allow others to see your profile</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-text">Analytics Tracking</p>
                        <p className="text-sm text-text-secondary">Help us improve with anonymous usage data</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-text">Personalized Ads</p>
                        <p className="text-sm text-text-secondary">Show relevant ads based on your activity</p>
                      </div>
                      <input type="checkbox" className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};