import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building, FileText, DollarSign, Settings, UserPlus, UserCheck, UserX, Search, Download, BarChart, Eye, Edit } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/Card';
import { Badge, StatusBadge } from '../../../shared/ui/Badge';
import { Table, Pagination } from '../../../shared/ui/Table';
import { Dropdown, type SelectOption } from '../../../shared/ui/Dropdown';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';
import { Modal } from '../../../shared/ui/Modal';
import { Input, Select } from '../../../shared/ui/Input';
import { api } from '../../../shared/api/client';

const userRoleOptions: SelectOption[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'client', label: 'Client' },
  { value: 'partner', label: 'Partner' },
  { value: 'company', label: 'Company Staff' },
  { value: 'admin', label: 'Admin' },
];

const userStatusOptions: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending Verification' },
  { value: 'suspended', label: 'Suspended' },
];

const stats = [
  { label: 'Total Users', icon: Users, color: 'primary' },
  { label: 'Active Partners', icon: Building, color: 'secondary' },
  { label: 'Open Requests', icon: FileText, color: 'warning' },
  { label: 'Revenue (30d)', icon: DollarSign, color: 'success' },
];

const userColumns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name', render: (row: any) => (
    <div>
      <p className="font-medium text-text">{row.name}</p>
      <p className="text-xs text-text-muted">{row.email}</p>
    </div>
  )},
  { key: 'role', header: 'Role', render: (row: any) => <Badge variant="primary" className="capitalize">{row.role}</Badge> },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { key: 'joined', header: 'Joined' },
  { key: 'activity', header: 'Activity', render: (row: any) => (
    <div className="text-sm">
      {row.orders ? `${row.orders} orders, TZS ${row.spent?.toLocaleString()}` : ''}
      {row.listings ? `${row.listings} listings, TZS ${row.revenue?.toLocaleString()}` : ''}
      {row.managed ? `${row.managed} managed` : ''}
    </div>
  )},
  { key: 'actions', header: 'Actions', render: (_row: any) => (
    <div className="flex items-center gap-1">
      <button className="btn btn-ghost btn-sm p-1.5" aria-label="View"><Eye className="w-4 h-4" /></button>
      <button className="btn btn-ghost btn-sm p-1.5" aria-label="Edit"><Edit className="w-4 h-4" /></button>
      {_row.status !== 'suspended' && (
        <button className="btn btn-ghost btn-sm p-1.5 text-error" aria-label="Suspend"><UserX className="w-4 h-4" /></button>
      )}
    </div>
  )},
];

const requestColumns = [
  { key: 'id', header: 'Request ID' },
  { key: 'client', header: 'Client' },
  { key: 'type', header: 'Type', render: (row: any) => <Badge variant="primary" className="capitalize">{row.type.replace('_', ' ')}</Badge> },
  { key: 'title', header: 'Project' },
  { key: 'status', header: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { key: 'assigned', header: 'Assigned To', render: (row: any) => row.assigned || (
    <Button variant="ghost" size="sm" className="text-warning">Assign</Button>
  )},
  { key: 'date', header: 'Date' },
  { key: 'actions', header: 'Actions', render: (_row: any) => (
    <div className="flex items-center gap-1">
      <button className="btn btn-ghost btn-sm p-1.5" aria-label="View"><Eye className="w-4 h-4" /></button>
      <button className="btn btn-ghost btn-sm p-1.5" aria-label="Assign"><UserCheck className="w-4 h-4" /></button>
    </div>
  )},
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

export const AdminDashboard = () => {
  const { t } = useI18n();
  const { items: apiUsers, refresh: refreshUsers } = useApiCollection<any>('/users');
  const { items: apiRequests } = useApiCollection<any>('/consultations');
  const { items: apiProducts } = useApiCollection<any>('/products');
  const { items: apiLabour } = useApiCollection<any>('/labourJobs');
  const [userSearch, setUserSearch] = React.useState('');
  const [userRoleFilter, setUserRoleFilter] = React.useState('all');
  const [userStatusFilter, setUserStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [requestStatusFilter, setRequestStatusFilter] = React.useState('all');
  const itemsPerPage = 10;

  const filteredUsers = apiUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const statValues = [
    apiUsers.length,
    apiUsers.filter((u: any) => u.role === 'partner' || u.role === 'company').length,
    apiRequests.filter((r: any) => (r.status || '') !== 'delivered').length,
    apiProducts.length,
  ];

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const [showAddUser, setShowAddUser] = React.useState(false);
  const [addUserLoading, setAddUserLoading] = React.useState(false);
  const [addUserError, setAddUserError] = React.useState('');
  const [newUser, setNewUser] = React.useState({ fullName: '', email: '', phone: '', role: 'company', password: '' });

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError('');
    try {
      const res = await api.post('/users', newUser);
      if (res.error) {
        setAddUserError(res.error.message);
      } else {
        setShowAddUser(false);
        setNewUser({ fullName: '', email: '', phone: '', role: 'company', password: '' });
        refreshUsers();
      }
    } catch (err) {
      setAddUserError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 shadow-sm">
              Admin command center
            </p>
            <h2 className="text-3xl font-bold text-text">Operations and platform oversight</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Review users, assign requests, and monitor the business performance of the whole platform in one view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setShowAddUser(true)} className="btn btn-primary btn-sm">Add user</button>
            <Link to={ROUTES.SETTINGS} className="btn btn-outline btn-sm">System settings</Link>
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
                <p className="text-3xl font-bold text-text mt-1">{statValues[index]}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center gradient-primary">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-3 px-4">
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted">
                No analytics data available yet
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Revenue (M)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary" />
                <span>Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent" />
                <span>New Users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to={ROUTES.DASHBOARD_ADMIN} className="btn btn-outline justify-start gap-3 w-full">
                <UserPlus className="w-5 h-5" />
                <span>Add New User</span>
              </Link>
              <Link to={ROUTES.CONSULTATION} className="btn btn-outline justify-start gap-3 w-full">
                <FileText className="w-5 h-5" />
                <span>Manage Requests</span>
              </Link>
              <Link to={ROUTES.REAL_ESTATE_LISTINGS} className="btn btn-outline justify-start gap-3 w-full">
                <Building className="w-5 h-5" />
                <span>Review Listings</span>
              </Link>
              <Link to={ROUTES.DASHBOARD_ADMIN} className="btn btn-outline justify-start gap-3 w-full">
                <BarChart className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
              <Link to={ROUTES.SETTINGS} className="btn btn-outline justify-start gap-3 w-full">
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="search"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <Dropdown
                options={userRoleOptions}
                value={userRoleFilter}
                onChange={setUserRoleFilter}
                placeholder={t('common.filter')}
                className="w-36"
              />
              <Dropdown
                options={userStatusOptions}
                value={userStatusFilter}
                onChange={setUserStatusFilter}
                placeholder={t('common.filter')}
                className="w-36"
              />
              <Button variant="outline"><Download className="w-4 h-4 mr-1" />Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={userColumns}
            data={filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            keyExtractor={(row) => row.id}
            hoverable
          />
          {totalUserPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalUserPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Requests Management */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Consultation Requests</CardTitle>
            <div className="flex items-center gap-3">
              <Dropdown
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'in_review', label: 'In Review' },
                  { value: 'quoted', label: 'Quoted' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'delivered', label: 'Delivered' },
                ]}
                value={requestStatusFilter}
                onChange={setRequestStatusFilter}
                placeholder={t('common.filter')}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={requestColumns}
            data={apiRequests.filter((request) => requestStatusFilter === 'all' || request.status === requestStatusFilter)}
            keyExtractor={(row) => row.id}
            hoverable
          />
        </CardContent>
      </Card>
      {/* Construction Operations */}
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Construction Operations</CardTitle>
            <p className="text-sm text-text-secondary mt-1">Building materials and labour jobs managed by the admin team</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-text mb-3">Materials</h3>
              <Table columns={materialColumns} data={apiProducts} keyExtractor={(row) => row.id} hoverable emptyMessage="No materials yet" />
            </div>
            <div>
              <h3 className="font-semibold text-text mb-3">Labour Jobs</h3>
              <Table columns={labourColumns} data={apiLabour} keyExtractor={(row) => row.id} hoverable emptyMessage="No labour jobs yet" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Add User Modal */}
      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User" description="Create a staff or platform account (admin only)">
        <form onSubmit={handleAddUser} className="space-y-4">
          {addUserError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{addUserError}</div>
          )}
          <Input label="Full name" name="fullName" value={newUser.fullName} onChange={handleNewUserChange} placeholder="e.g. Jane Doe" required />
          <Input label="Email" name="email" type="email" value={newUser.email} onChange={handleNewUserChange} placeholder="name@ujenzi25.com" required />
          <Input label="Phone" name="phone" type="tel" value={newUser.phone} onChange={handleNewUserChange} placeholder="+255 7XX XXX XXX" required />
          <Select
            label="Role"
            name="role"
            value={newUser.role}
            onChange={handleNewUserChange}
            options={[
              { value: 'client', label: 'Client' },
              { value: 'partner', label: 'Partner' },
              { value: 'company', label: 'Staff (Company)' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
          <Input label="Temporary password" name="password" type="text" value={newUser.password} onChange={handleNewUserChange} placeholder="Min 8 characters" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button type="submit" loading={addUserLoading}>Create user</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};