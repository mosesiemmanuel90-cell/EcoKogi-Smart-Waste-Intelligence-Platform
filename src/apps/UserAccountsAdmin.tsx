import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, Trash2, EllipsisVertical, Key,
  CircleCheck, CircleX, Info, Filter, ChevronDown, ChevronRight,
  Users, Mail, Phone, Calendar, Shield, UserCheck, UserX,
  Eye, EyeOff, Lock, RefreshCw, CircleAlert, Check, Pencil,
  ListFilter, ArrowUpDown, X, Clock, Send,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────
type UserRole = 'Admin' | 'Officer' | 'Citizen' | 'Vendor' | 'Super Admin';
type UserStatus = 'active' | 'inactive' | 'suspended';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedLga: string;
  status: UserStatus;
  lastLogin: string;
  dateCreated: string;
}

type ModalType = 'add' | 'edit' | 'reset-password' | 'view-details' | null;

// ─── Mock Data ───────────────────────────────────────────────────────────
const LGAS = ['Lokoja', 'Okene', 'Kabba', 'Ankpa', 'Idah', 'Dekina', 'Ogori-Magongo', 'Adavi'];
const ROLES: UserRole[] = ['Admin', 'Officer', 'Citizen', 'Vendor', 'Super Admin'];

const MOCK_USERS: UserAccount[] = [
  { id: 'u1', name: 'Amina Bello', email: 'amina.bello@kogigov.ng', phone: '+234-803-111-2233', role: 'Admin', assignedLga: 'Lokoja', status: 'active', lastLogin: '2025-06-10 08:30', dateCreated: '2024-01-15' },
  { id: 'u2', name: 'Chidi Okafor', email: 'chidi.okafor@kogigov.ng', phone: '+234-803-222-3344', role: 'Officer', assignedLga: 'Okene', status: 'active', lastLogin: '2025-06-09 14:20', dateCreated: '2024-03-22' },
  { id: 'u3', name: 'Fatima Usman', email: 'fatima.usman@gmail.com', phone: '+234-803-333-4455', role: 'Citizen', assignedLga: 'Kabba', status: 'active', lastLogin: '2025-06-08 11:10', dateCreated: '2024-06-01' },
  { id: 'u4', name: 'Emeka Nwosu', email: 'emeka.nwosu@recycle.ng', phone: '+234-803-444-5566', role: 'Vendor', assignedLga: 'Lokoja', status: 'inactive', lastLogin: '2025-04-20 09:45', dateCreated: '2024-02-10' },
  { id: 'u5', name: 'Sarah John', email: 'sarah.john@kogigov.ng', phone: '+234-803-555-6677', role: 'Super Admin', assignedLga: 'Lokoja', status: 'active', lastLogin: '2025-06-10 10:00', dateCreated: '2023-11-05' },
  { id: 'u6', name: 'Ibrahim Musa', email: 'ibrahim.musa@kogigov.ng', phone: '+234-803-666-7788', role: 'Officer', assignedLga: 'Ankpa', status: 'active', lastLogin: '2025-06-07 07:15', dateCreated: '2024-04-18' },
  { id: 'u7', name: 'Grace Ogunleye', email: 'grace.ogunleye@gmail.com', phone: '+234-803-777-8899', role: 'Citizen', assignedLga: 'Idah', status: 'suspended', lastLogin: '2025-03-12 16:30', dateCreated: '2024-08-12' },
  { id: 'u8', name: 'Mohammed Ali', email: 'mohammed.ali@recycle.ng', phone: '+234-803-888-9900', role: 'Vendor', assignedLga: 'Dekina', status: 'active', lastLogin: '2025-06-09 13:00', dateCreated: '2024-05-20' },
  { id: 'u9', name: 'Blessing Eze', email: 'blessing.eze@kogigov.ng', phone: '+234-803-999-0011', role: 'Admin', assignedLga: 'Okene', status: 'inactive', lastLogin: '2025-05-30 08:00', dateCreated: '2024-07-01' },
  { id: 'u10', name: 'Daniel Garba', email: 'daniel.garba@gmail.com', phone: '+234-803-101-1122', role: 'Citizen', assignedLga: 'Ogori-Magongo', status: 'active', lastLogin: '2025-06-08 18:45', dateCreated: '2024-09-14' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
const statusBadge = (status: UserStatus) => {
  const map: Record<UserStatus, { label: string; class: string; icon: React.ElementType }> = {
    active: { label: 'Active', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CircleCheck },
    inactive: { label: 'Inactive', class: 'bg-slate-100 text-slate-600 border-slate-200', icon: CircleX },
    suspended: { label: 'Suspended', class: 'bg-red-100 text-red-700 border-red-200', icon: CircleAlert },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${m.class}`}>
      <m.icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
};

const roleBadge = (role: UserRole) => {
  const colorMap: Record<UserRole, string> = {
    Admin: 'bg-blue-100 text-blue-700 border-blue-200',
    'Super Admin': 'bg-purple-100 text-purple-700 border-purple-200',
    Officer: 'bg-amber-100 text-amber-700 border-amber-200',
    Citizen: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Vendor: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${colorMap[role]}`}>
      <Shield className="w-3 h-3" />
      {role}
    </span>
  );
};

// ─── User Account Form Data ──────────────────────────────────────────────
interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedLga: string;
  status: UserStatus;
}

const defaultFormData: UserFormData = {
  name: '', email: '', phone: '', role: 'Citizen', assignedLga: 'Lokoja', status: 'active',
};

// ─── Main Component ──────────────────────────────────────────────────────
export const UserAccountsAdmin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // ── State ──
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [lgaFilter, setLgaFilter] = useState<string>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [passwordResetDone, setPasswordResetDone] = useState(false);

  // ── Derived ──
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesLga = lgaFilter === 'all' || u.assignedLga === lgaFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesLga;
    });
  }, [users, search, roleFilter, statusFilter, lgaFilter]);

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setLgaFilter('all');
  };

  const hasActiveFilters = search || roleFilter !== 'all' || statusFilter !== 'all' || lgaFilter !== 'all';

  // ── Actions ──
  const openAdd = () => {
    setSelectedUser(null);
    setFormData(defaultFormData);
    setModalType('add');
  };

  const openEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedLga: user.assignedLga,
      status: user.status,
    });
    setModalType('edit');
  };

  const openViewDetails = (user: UserAccount) => {
    setSelectedUser(user);
    setModalType('view-details');
  };

  const openResetPassword = (user: UserAccount) => {
    setSelectedUser(user);
    setPasswordResetDone(false);
    setModalType('reset-password');
  };

  const handleSubmit = () => {
    if (modalType === 'add') {
      const newUser: UserAccount = {
        ...formData,
        id: `u_${Date.now()}`,
        lastLogin: 'N/A',
        dateCreated: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      toast.success(`User "${formData.name}" added successfully`);
    } else if (modalType === 'edit' && selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
      toast.success(`User "${formData.name}" updated successfully`);
    }
    setModalType(null);
    setSelectedUser(null);
  };

  const handleResetPassword = () => {
    setPasswordResetDone(true);
    toast.success(`Password reset link sent to ${selectedUser?.email}`);
  };

  const toggleUserStatus = (user: UserAccount) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : user.status === 'inactive' ? 'active' : 'active';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    toast.success(`User "${user.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const handleDelete = (user: UserAccount) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast.success(`User "${user.name}" removed`);
  };

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium">Government Portal</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-medium">Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-semibold">User Accounts</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">User Accounts</h2>
              <p className="text-sm text-slate-500">Oversee portal access levels, citizen accounts, and administrative roles</p>
            </div>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Users</p>
              <p className="text-xl font-bold text-slate-900">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active</p>
              <p className="text-xl font-bold text-slate-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Inactive</p>
              <p className="text-xl font-bold text-slate-900">{users.filter(u => u.status === 'inactive').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
              <CircleAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Suspended</p>
              <p className="text-xl font-bold text-slate-900">{users.filter(u => u.status === 'suspended').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
                  className="px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
                <select
                  value={lgaFilter}
                  onChange={(e) => setLgaFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All LGAs</option>
                  {LGAS.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                </select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-slate-500 gap-1">
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">LGA</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Last Login</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-500">No users found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-purple-50/50 transition-colors`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.dateCreated}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {user.email}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {user.phone}
                    </span>
                  </td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4 text-slate-600">{user.assignedLga}</td>
                  <td className="px-5 py-4">{statusBadge(user.status)}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-500 text-xs whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {user.lastLogin}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openViewDetails(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openResetPassword(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Reset Password"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {filteredUsers.length} of {users.length} users shown
          </span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium">
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* ── Add/Edit Modal ── */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalType(null)}>
          <Card className="w-full max-w-lg border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {modalType === 'add' ? <Plus className="w-5 h-5 text-purple-600" /> : <Pencil className="w-5 h-5 text-amber-600" />}
                {modalType === 'add' ? 'Add New User' : 'Edit User'}
              </CardTitle>
              <CardDescription>
                {modalType === 'add' ? 'Create a new user account with role and permissions' : 'Update user account details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234-XXX-XXX-XXXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned LGA</label>
                  <select
                    value={formData.assignedLga}
                    onChange={e => setFormData({ ...formData, assignedLga: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {LGAS.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <Button variant="outline" onClick={() => setModalType(null)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!formData.name || !formData.email}
              >
                {modalType === 'add' ? 'Add User' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {modalType === 'reset-password' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalType(null)}>
          <Card className="w-full max-w-md border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {passwordResetDone ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-800">Password Reset Sent</p>
                  <p className="text-sm text-slate-500">
                    A password reset link has been sent to <strong>{selectedUser.email}</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <CircleAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800">
                      This will send a password reset email to <strong>{selectedUser.name}</strong> at {selectedUser.email}.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                      {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{selectedUser.name}</p>
                      <p className="text-xs text-slate-500">{selectedUser.role} · {selectedUser.assignedLga}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-4">
              <Button variant="outline" onClick={() => setModalType(null)}>
                {passwordResetDone ? 'Close' : 'Cancel'}
              </Button>
              {!passwordResetDone && (
                <Button onClick={handleResetPassword} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {modalType === 'view-details' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalType(null)}>
          <Card className="w-full max-w-lg border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  User Details
                </CardTitle>
                <button onClick={() => setModalType(null)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {roleBadge(selectedUser.role)}
                    {statusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailField icon={Mail} label="Email" value={selectedUser.email} />
                <DetailField icon={Phone} label="Phone" value={selectedUser.phone} />
                <DetailField icon={Users} label="Assigned LGA" value={selectedUser.assignedLga} />
                <DetailField icon={Calendar} label="Date Created" value={selectedUser.dateCreated} />
                <DetailField icon={Clock} label="Last Login" value={selectedUser.lastLogin} />
                <DetailField icon={Shield} label="User ID" value={selectedUser.id} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleUserStatus(selectedUser);
                  setSelectedUser(prev => prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : prev.status === 'inactive' ? 'active' : 'active' } : null);
                }}
                className="gap-1.5"
              >
                {selectedUser.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" onClick={() => setModalType(null)}>Close</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Detail Field Component ──────────────────────────────────────────────
const DetailField: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </p>
    <p className="text-sm font-medium text-slate-800">{value}</p>
  </div>
);