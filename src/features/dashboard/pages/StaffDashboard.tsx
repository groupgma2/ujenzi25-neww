import React from 'react';
import { Box, Hammer, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/Card';
import { Badge, StatusBadge } from '../../../shared/ui/Badge';
import { Table } from '../../../shared/ui/Table';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

// Staff (company) operations workspace — construction materials, labour jobs and
// consultation management on behalf of the admin team.
export const StaffDashboard = () => {
  const { items: products } = useApiCollection<any>('/products');
  const { items: labourJobs } = useApiCollection<any>('/labourJobs');
  const { items: consultations } = useApiCollection<any>('/consultations');

  const stats = [
    { label: 'Materials', icon: Box, value: products.length },
    { label: 'Labour Jobs', icon: Hammer, value: labourJobs.length },
    { label: 'Open Consultations', icon: FileText, value: consultations.filter((c: any) => (c.status || '') !== 'delivered').length },
    { label: 'In Review', icon: CheckCircle, value: consultations.filter((c: any) => c.status === 'in_review').length },
  ];

  const materialColumns = [
    { key: 'name', header: 'Material' },
    { key: 'category', header: 'Category', render: (row: any) => <Badge variant="secondary" className="capitalize">{row.category}</Badge> },
    { key: 'price', header: 'Price', render: (row: any) => `TZS ${row.price?.toLocaleString()}` },
    { key: 'stock', header: 'Stock', render: (row: any) => row.availableQuantity?.toLocaleString() },
  ];

  const labourColumns = [
    { key: 'title', header: 'Job' },
    { key: 'category', header: 'Trade', render: (row: any) => <Badge variant="primary" className="capitalize">{row.category}</Badge> },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  ];

  const consultationColumns = [
    { key: 'title', header: 'Project' },
    { key: 'type', header: 'Type', render: (row: any) => <Badge variant="primary" className="capitalize">{row.type}</Badge> },
    { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
              Staff operations
            </p>
            <h2 className="text-3xl font-bold text-text">Construction & consultation workspace</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Manage building materials, labour jobs and client consultations on behalf of the admin team.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-3xl font-bold text-text mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center gradient-primary">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Building Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table columns={materialColumns} data={products} keyExtractor={(row) => row.id} hoverable emptyMessage="No materials yet" />
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Labour Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table columns={labourColumns} data={labourJobs} keyExtractor={(row) => row.id} hoverable emptyMessage="No labour jobs yet" />
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Consultation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table columns={consultationColumns} data={consultations} keyExtractor={(row) => row.id} hoverable emptyMessage="No consultations yet" />
        </CardContent>
      </Card>
    </div>
  );
};
