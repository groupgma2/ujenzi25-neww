import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Box, Home, Calendar, Users, Building, DollarSign } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/Card';
import { Badge, StatusBadge } from '../../../shared/ui/Badge';
import { Table } from '../../../shared/ui/Table';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const stats = [
  { label: 'Active Requests', icon: FileText, color: 'primary' },
  { label: 'Pending Orders', icon: Box, color: 'secondary' },
  { label: 'Upcoming Bookings', icon: Calendar, color: 'success' },
  { label: 'Total Spent', icon: DollarSign, color: 'warning' },
];

export const ClientDashboard = () => {
  const { t } = useI18n();
  const { items: consultations } = useApiCollection<any>('/consultations');
  const { items: orders } = useApiCollection<any>('/orders');
  const { items: bookings } = useApiCollection<any>('/bookings');

  const requests = consultations.map((request) => ({ id: request.id, type: (request.serviceType || 'consultation').toLowerCase().replaceAll(' drawing', ''), title: request.projectName || request.title || 'Consultation request', status: (request.status || 'submitted').toLowerCase().replaceAll(' ', '_'), date: request.requestDate || request.createdAt || '', consultant: request.assignedConsultant }));
  const orderRows = orders.map((order) => ({ id: order.id, item: Array.isArray(order.products) ? order.products.join(', ') : order.item || 'Material order', supplier: order.supplier || 'Supplier', status: (order.orderStatus || order.status || 'pending').toLowerCase(), amount: order.total || order.amount || 0, date: order.date || order.createdAt || '' }));
  const bookingRows = bookings.map((booking) => ({ id: booking.id, property: booking.property || booking.title || 'Booking', type: booking.type || 'hotel', checkIn: booking.checkIn || '', checkOut: booking.checkOut || '', status: (booking.bookingStatus || booking.status || 'pending').toLowerCase(), amount: booking.amount || 0 }));

  const requestColumns = [
    { key: 'id', header: 'Request ID' },
    { key: 'type', header: 'Type', render: (row: any) => (
      <Badge variant="primary" className="capitalize">{row.type.replace('_', ' ')}</Badge>
    )},
    { key: 'title', header: 'Project' },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'date', header: 'Date' },
    { key: 'actions', header: 'Actions', render: (row: any) => (
      <Link to={`/consultation/${row.id}`} className="btn btn-ghost btn-sm">{t('common.view')}</Link>
    )},
  ];

  const orderColumns = [
    { key: 'id', header: 'Order ID' },
    { key: 'item', header: 'Item' },
    { key: 'supplier', header: 'Supplier' },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'amount', header: 'Amount', render: (row: any) => `TZS ${row.amount.toLocaleString()}` },
    { key: 'date', header: 'Date' },
  ];

  const bookingColumns = [
    { key: 'id', header: 'Booking ID' },
    { key: 'property', header: 'Property' },
    { key: 'type', header: 'Type', render: (row: any) => <Badge variant="secondary" className="capitalize">{row.type}</Badge> },
    { key: 'dates', header: 'Dates', render: (row: any) => `${row.checkIn} - ${row.checkOut}` },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'amount', header: 'Amount', render: (row: any) => `TZS ${row.amount.toLocaleString()}` },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-orange-200 bg-gradient-to-r from-primary-bg via-orange-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
              Client workspace
            </p>
            <h2 className="text-3xl font-bold text-text">Your project progress at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Track your consultations, orders, and bookings in one place without losing focus on the next step.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.CONSULTATION_REQUEST} className="btn btn-primary btn-sm">New consultation</Link>
            <Link to={ROUTES.CONSTRUCTION_MATERIALS} className="btn btn-outline btn-sm">Order materials</Link>
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

      {/* Quick Actions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to={ROUTES.CONSULTATION_REQUEST} className="btn btn-outline justify-start gap-3 h-full p-4">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium text-text">New Consultation</p>
                <p className="text-xs text-text-muted">Request drawings or BoQ</p>
              </div>
            </Link>
            <Link to={ROUTES.CONSTRUCTION_MATERIALS} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Box className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium text-text">Order Materials</p>
                <p className="text-xs text-text-muted">Browse verified suppliers</p>
              </div>
            </Link>
            <Link to={ROUTES.CONSTRUCTION_POST_JOB} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Users className="w-6 h-6 text-accent" />
              <div>
                <p className="font-medium text-text">Post Labour Job</p>
                <p className="text-xs text-text-muted">Find skilled workers</p>
              </div>
            </Link>
            <Link to={ROUTES.RENTAL_LISTINGS} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Home className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-text">Find Rental</p>
                <p className="text-xs text-text-muted">Browse verified listings</p>
              </div>
            </Link>
            <Link to={ROUTES.HOTELS_LISTINGS} className="btn btn-outline justify-start gap-3 h-full p-4">
              <Building className="w-6 h-6 text-warning" />
              <div>
                <p className="font-medium text-text">Book Stay</p>
                <p className="text-xs text-text-muted">Hotels & Airbnb</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link to={ROUTES.DASHBOARD_CLIENT} className="text-sm text-primary hover:underline">{t('common.viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
              No activity yet. Updates will appear here as you use the platform.
            </div>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Requests</CardTitle>
              <Link to={ROUTES.CONSULTATION_MY_REQUESTS} className="text-sm text-primary hover:underline">{t('common.viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={requestColumns}
              data={requests}
              keyExtractor={(row) => row.id}
              hoverable
            />
          </CardContent>
        </Card>
      </div>

      {/* Orders & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link to={ROUTES.CONSTRUCTION_MY_ORDERS} className="text-sm text-primary hover:underline">{t('common.viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={orderColumns}
              data={orderRows}
              keyExtractor={(row) => row.id}
              hoverable
            />
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Link to={ROUTES.HOTELS_LISTINGS} className="text-sm text-primary hover:underline">{t('common.viewAll')}</Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table
              columns={bookingColumns}
              data={bookingRows}
              keyExtractor={(row) => row.id}
              hoverable
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};