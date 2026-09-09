import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building, DollarSign, Eye, Edit, FileText, Users, CheckCircle } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/Card';
import { StatusBadge } from '../../../shared/ui/Badge';
import { Table } from '../../../shared/ui/Table';
import { Dropdown, type SelectOption } from '../../../shared/ui/Dropdown';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const propertyStatusOptions: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'under_offer', label: 'Under Offer' },
  { value: 'sold', label: 'Sold' },
  { value: 'draft', label: 'Draft' },
];

const rentalStatusOptions: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

const hotelStatusOptions: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

const stats = [
  { label: 'Active Listings', icon: Building, color: 'primary' },
  { label: 'Total Views', icon: Eye, color: 'secondary' },
  { label: 'Inquiries', icon: Users, color: 'success' },
  { label: 'Revenue (30d)', icon: DollarSign, color: 'warning' },
];

const propertyColumns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Property', render: (row: any) => (
    <div>
      <p className="font-medium text-text">{row.title}</p>
      <p className="text-xs text-text-muted capitalize">{row.type}</p>
    </div>
  )},
  { key: 'price', header: 'Price', render: (row: any) => `TZS ${row.price.toLocaleString()}` },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { key: 'views', header: 'Views', render: (row: any) => `${row.views}` },
  { key: 'inquiries', header: 'Inquiries', render: (row: any) => `${row.inquiries}` },
  { key: 'actions', header: 'Actions', render: (row: any) => (
    <div className="flex items-center gap-1">
      <Link to={`/real-estate/${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="View"><Eye className="w-4 h-4" /></Link>
      <Link to={`${ROUTES.REAL_ESTATE_ADD}?edit=${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="Edit"><Edit className="w-4 h-4" /></Link>
    </div>
  )},
];

const rentalColumns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Listing', render: (row: any) => (
    <div>
      <p className="font-medium text-text">{row.title}</p>
      <p className="text-xs text-text-muted capitalize">{row.type}</p>
    </div>
  )},
  { key: 'rent', header: 'Rent/Month', render: (row: any) => `TZS ${row.rent.toLocaleString()}` },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { key: 'views', header: 'Views', render: (row: any) => `${row.views}` },
  { key: 'applications', header: 'Applications', render: (row: any) => `${row.applications}` },
  { key: 'actions', header: 'Actions', render: (row: any) => (
    <div className="flex items-center gap-1">
      <Link to={`/rental/${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="View"><Eye className="w-4 h-4" /></Link>
      <Link to={`${ROUTES.RENTAL_ADD}?edit=${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="Edit"><Edit className="w-4 h-4" /></Link>
    </div>
  )},
];

const hotelColumns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Property', render: (row: any) => (
    <div>
      <p className="font-medium text-text">{row.name}</p>
      <p className="text-xs text-text-muted capitalize">{row.type}</p>
    </div>
  )},
  { key: 'rating', header: 'Rating', render: (row: any) => (
    <div className="flex items-center gap-1">
      <CheckCircle className="w-3.5 h-3.5 text-warning fill-current" />
      <span>{row.rating}</span>
    </div>
  )},
  { key: 'bookings', header: 'Bookings (30d)', render: (row: any) => `${row.bookings}` },
  { key: 'revenue', header: 'Revenue (30d)', render: (row: any) => `TZS ${row.revenue.toLocaleString()}` },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { key: 'actions', header: 'Actions', render: (row: any) => (
    <div className="flex items-center gap-1">
      <Link to={`/hotels/${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="View"><Eye className="w-4 h-4" /></Link>
      <Link to={`${ROUTES.HOTELS_ADD}?edit=${row.id}`} className="btn btn-ghost btn-sm p-1.5" aria-label="Edit"><Edit className="w-4 h-4" /></Link>
    </div>
  )},
];

export const PartnerDashboard = () => {
  const { t } = useI18n();
  const { items: apiProperties } = useApiCollection<any>('/properties');
  const { items: apiRentals } = useApiCollection<any>('/rentals');
  const { items: apiHotels } = useApiCollection<any>('/hotels');
  const [propertyFilter, setPropertyFilter] = React.useState('all');
  const [rentalFilter, setRentalFilter] = React.useState('all');
  const [hotelFilter, setHotelFilter] = React.useState('all');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
              Partner workspace
            </p>
            <h2 className="text-3xl font-bold text-text">Grow and manage your listings</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Monitor performance across property, rental, and hotel listings with direct actions for new uploads and updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.REAL_ESTATE_ADD} className="btn btn-primary btn-sm">Add property</Link>
            <Link to={ROUTES.HOTELS_ADD} className="btn btn-outline btn-sm">Add stay</Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-3xl font-bold text-text mt-1">0</p>
                <p className="text-xs text-text-muted mt-2">No data yet</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `var(--color-${stat.color}-bg)` }}>
                <stat.icon className="w-6 h-6" style={{ color: `var(--color-${stat.color})` }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Listing performance</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">A quick view of where your audience is engaging.</p>
            </div>
            <span className="text-sm font-semibold text-emerald-700">+18% this month</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Property listings', value: 78, color: 'bg-primary' },
              { label: 'Rental listings', value: 56, color: 'bg-emerald-500' },
              { label: 'Hotel and Airbnb listings', value: 42, color: 'bg-cyan-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-text">{item.label}</span>
                  <span className="text-text-secondary">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={ROUTES.REAL_ESTATE_ADD} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Plus className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium text-text">Add Property</p>
                <p className="text-xs text-text-muted">List for sale or development</p>
              </div>
            </Link>
            <Link to={ROUTES.RENTAL_ADD} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Plus className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-text">Add Rental</p>
                <p className="text-xs text-text-muted">List for long-term rent</p>
              </div>
            </Link>
            <Link to={ROUTES.HOTELS_ADD} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Plus className="w-6 h-6 text-warning" />
              <div>
                <p className="font-medium text-text">Add Hotel/Airbnb</p>
                <p className="text-xs text-text-muted">List for short-term stays</p>
              </div>
            </Link>
            <Link to={ROUTES.DASHBOARD_PARTNER} className="btn btn-outline justify-start gap-3 h-full p-4">
              <FileText className="w-6 h-6 text-accent" />
              <div>
                <p className="font-medium text-text">View Reports</p>
                <p className="text-xs text-text-muted">Analytics & performance</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Property Listings</CardTitle>
            <div className="flex items-center gap-3">
              <Dropdown
                options={propertyStatusOptions}
                value={propertyFilter}
                onChange={setPropertyFilter}
                placeholder={t('common.filter')}
                className="w-40"
              />
              <Link to={ROUTES.REAL_ESTATE_ADD}>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Property</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={propertyColumns}
            data={apiProperties}
            keyExtractor={(row) => row.id}
            hoverable
          />
        </CardContent>
      </Card>

      {/* Rentals */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Rental Listings</CardTitle>
            <div className="flex items-center gap-3">
              <Dropdown
                options={rentalStatusOptions}
                value={rentalFilter}
                onChange={setRentalFilter}
                placeholder={t('common.filter')}
                className="w-40"
              />
              <Link to={ROUTES.RENTAL_ADD}>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Rental</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={rentalColumns}
            data={apiRentals}
            keyExtractor={(row) => row.id}
            hoverable
          />
        </CardContent>
      </Card>

      {/* Hotels */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Hotel & Airbnb Listings</CardTitle>
            <div className="flex items-center gap-3">
              <Dropdown
                options={hotelStatusOptions}
                value={hotelFilter}
                onChange={setHotelFilter}
                placeholder={t('common.filter')}
                className="w-40"
              />
              <Link to={ROUTES.HOTELS_ADD}>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Property</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={hotelColumns}
            data={apiHotels}
            keyExtractor={(row) => row.id}
            hoverable
          />
        </CardContent>
      </Card>
    </div>
  );
};