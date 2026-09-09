import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button } from '../shared/ui/Button';
import { Input, Textarea } from '../shared/ui/Input';
import { Card, CardContent } from '../shared/ui/Card';
import { Avatar, Badge } from '../shared/ui/Badge';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    region: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
    if (!formData.email) newErrors.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.email');
    if (!formData.phone) newErrors.phone = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'preferences', label: 'Preferences', icon: User },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card padding="lg">
        <CardContent className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <Avatar
              src={user?.avatar}
              name={user?.fullName || 'User'}
              size="xl"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-text">{user?.fullName}</h1>
            <p className="text-text-secondary mt-1">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="primary" className="capitalize">{user?.role}</Badge>
              <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? t('common.cancel') : t('common.edit')}
            </Button>
{isEditing && (
              <Button onClick={(e) => handleSave(e)} loading={isSaving}>
                {t('common.save')}
                <Save className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-700" role="alert">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>Profile updated successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700" role="alert">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>Failed to update profile. Please try again.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-8 overflow-x-auto" aria-label="Profile sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card padding="lg">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('auth.fullName')}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                disabled={!isEditing}
              />
              <Input
                label={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('auth.phone')}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                disabled={!isEditing}
              />
              <Input
                label="Role"
                name="role"
                value={user?.role || ''}
                disabled
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <Textarea
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              disabled={!isEditing}
            />
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {t('common.save')}
                  <Save className="w-5 h-5" />
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text mb-6">Change Password</h3>
          <form className="space-y-6 max-w-md">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              placeholder="••••••••"
            />
            <div className="pt-4 border-t border-border">
              <Button>Update Password</Button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text mb-4">Two-Factor Authentication</h3>
            <p className="text-text-secondary mb-4">Add an extra layer of security to your account.</p>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-text">Current Session</p>
                  <p className="text-sm text-text-muted">Chrome on Windows • Dar es Salaam, TZ</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-text">Mobile App</p>
                  <p className="text-sm text-text-muted">iOS • Arusha, TZ • 2 days ago</p>
                </div>
                <Button variant="ghost" size="sm">Revoke</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            {[
              { title: 'Email Notifications', description: 'Receive updates via email', items: [
                { label: 'New messages', enabled: true },
                { label: 'Order updates', enabled: true },
                { label: 'Booking confirmations', enabled: true },
                { label: 'Payment receipts', enabled: true },
                { label: 'Marketing emails', enabled: false },
              ]},
              { title: 'Push Notifications', description: 'Receive updates on your device', items: [
                { label: 'New messages', enabled: true },
                { label: 'Order updates', enabled: true },
                { label: 'Booking reminders', enabled: true },
              ]},
              { title: 'SMS Notifications', description: 'Receive critical updates via SMS', items: [
                { label: 'Payment confirmations', enabled: true },
                { label: 'Booking confirmations', enabled: true },
                { label: 'Security alerts', enabled: true },
              ]},
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-medium text-text mb-2">{section.title}</h4>
                <p className="text-sm text-text-secondary mb-4">{section.description}</p>
                <div className="space-y-3">
                  {section.items.map((item, i) => (
                    <label key={i} className="flex items-center justify-between cursor-pointer">
                      <span className="text-text">{item.label}</span>
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card padding="lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Language & Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="input" defaultValue="en">
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
                <select className="input" defaultValue="tz">
                  <option value="tz">Tanzania (TZS)</option>
                  <option value="us">United States (USD)</option>
                </select>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'system' ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg mb-2" style={{
                      background: theme === 'light' ? '#fff' : theme === 'dark' ? '#1a1a2e' : 'linear-gradient(to right, #fff, #1a1a2e)'
                    }} />
                    <p className="capitalize font-medium">{theme}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};