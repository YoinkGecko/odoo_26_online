'use client';
import React, { useState, useMemo } from 'react';
import { MOCK_DRIVERS, Driver, DriverStatus } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

const LICENSE_CATEGORIES = ['Class A', 'Class B', 'Class C'];
const STATUS_OPTIONS: DriverStatus[] = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const EMPTY_FORM = {
  name: '',
  licenseNumber: '',
  licenseCategory: 'Class C',
  licenseExpiry: '',
  contactNumber: '',
  safetyScore: '',
  status: 'Available' as DriverStatus,
};

function getLicenseExpiryStatus(expiry: string): { label: string; className: string } {
  const today = new Date('2026-07-12');
  const exp = new Date(expiry);
  const diffDays = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Expired', className: 'text-red-600 font-600' };
  if (diffDays <= 60) return { label: `Expires in ${diffDays}d`, className: 'text-amber-600 font-600' };
  return { label: expiry, className: 'text-muted-foreground' };
}

export default function DriverManagementContent() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Driver | null>(null);

  const filtered = useMemo(() => {
    let r = drivers;
    if (statusFilter !== 'All') r = r.filter((d) => d.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          d.contactNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [drivers, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: drivers.length };
    STATUS_OPTIONS.forEach((s) => { counts[s] = drivers.filter((d) => d.status === s).length; });
    return counts;
  }, [drivers]);

  const openCreate = () => {
    setEditDriver(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditDriver(d);
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry,
      contactNumber: d.contactNumber,
      safetyScore: String(d.safetyScore),
      status: d.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.licenseNumber.trim()) {
      setFormError('Driver name and license number are required.');
      return;
    }
    if (!form.licenseExpiry) {
      setFormError('License expiry date is required.');
      return;
    }
    const score = Number(form.safetyScore);
    if (form.safetyScore && (score < 0 || score > 100)) {
      setFormError('Safety score must be between 0 and 100.');
      return;
    }

    if (editDriver) {
      // TODO: Replace with API call → PUT /api/drivers/:id
      // await fetch(`/api/drivers/${editDriver.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editDriver.id
            ? {
                ...d,
                name: form.name.trim(),
                licenseNumber: form.licenseNumber.trim().toUpperCase(),
                licenseCategory: form.licenseCategory,
                licenseExpiry: form.licenseExpiry,
                contactNumber: form.contactNumber.trim(),
                safetyScore: score || d.safetyScore,
                status: form.status,
              }
            : d
        )
      );
    } else {
      // TODO: Replace with API call → POST /api/drivers
      // await fetch('/api/drivers', { method: 'POST', body: JSON.stringify(payload) });
      const newDriver: Driver = {
        id: `drv-${Date.now()}`,
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        licenseCategory: form.licenseCategory,
        licenseExpiry: form.licenseExpiry,
        contactNumber: form.contactNumber.trim(),
        safetyScore: score || 80,
        status: form.status,
      };
      setDrivers((prev) => [newDriver, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (d: Driver) => {
    // TODO: Replace with API call → DELETE /api/drivers/:id
    // await fetch(`/api/drivers/${d.id}`, { method: 'DELETE' });
    setDrivers((prev) => prev.filter((x) => x.id !== d.id));
    setDeleteConfirm(null);
  };

  const handleSuspend = (d: Driver) => {
    // TODO: Replace with API call → PATCH /api/drivers/:id/suspend
    // await fetch(`/api/drivers/${d.id}/suspend`, { method: 'PATCH' });
    setDrivers((prev) =>
      prev.map((x) => (x.id === d.id ? { ...x, status: 'Suspended' as DriverStatus } : x))
    );
  };

  const handleReactivate = (d: Driver) => {
    // TODO: Replace with API call → PATCH /api/drivers/:id/reactivate
    // await fetch(`/api/drivers/${d.id}/reactivate`, { method: 'PATCH' });
    setDrivers((prev) =>
      prev.map((x) => (x.id === d.id ? { ...x, status: 'Available' as DriverStatus } : x))
    );
  };

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Driver Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {drivers.length} drivers — {statusCounts['Available'] ?? 0} available, {statusCounts['Suspended'] ?? 0} suspended
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-600 rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="PlusIcon" size={16} />
          Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, license…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-sm border border-input rounded-md bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-56"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['All', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-8 px-3 text-xs font-500 rounded-md border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-input hover:bg-muted hover:text-foreground'
              }`}
            >
              {s}
              <span className="ml-1.5 opacity-70">{statusCounts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Driver', 'License #', 'Category', 'License Expiry', 'Contact', 'Safety Score', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No drivers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const expiryInfo = getLicenseExpiryStatus(d.licenseExpiry);
                  return (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-700 flex-shrink-0">
                            {d.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-500 text-foreground">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-tabular text-muted-foreground">{d.licenseNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.licenseCategory}</td>
                      <td className={`px-4 py-3 text-xs font-tabular ${expiryInfo.className}`}>{expiryInfo.label}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.contactNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${d.safetyScore >= 90 ? 'bg-green-500' : d.safetyScore >= 75 ? 'bg-amber-400' : 'bg-red-500'}`}
                              style={{ width: `${d.safetyScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-600 text-foreground font-tabular">{d.safetyScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(d)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit driver"
                          >
                            <Icon name="PencilIcon" size={14} />
                          </button>
                          {d.status === 'Suspended' ? (
                            <button
                              onClick={() => handleReactivate(d)}
                              className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                              title="Reactivate driver"
                            >
                              <Icon name="CheckCircleIcon" size={14} />
                            </button>
                          ) : d.status !== 'On Trip' ? (
                            <button
                              onClick={() => handleSuspend(d)}
                              className="p-1.5 rounded hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                              title="Suspend driver"
                            >
                              <Icon name="NoSymbolIcon" size={14} />
                            </button>
                          ) : null}
                          <button
                            onClick={() => setDeleteConfirm(d)}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Delete driver"
                          >
                            <Icon name="TrashIcon" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDriver ? 'Edit Driver' : 'Add New Driver'}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. John Smith"
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">License Number *</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="e.g. DL-12345"
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">License Category</label>
              <select
                value={form.licenseCategory}
                onChange={(e) => setForm((f) => ({ ...f, licenseCategory: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {LICENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">License Expiry *</label>
              <input
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => setForm((f) => ({ ...f, licenseExpiry: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Contact Number</label>
              <input
                type="text"
                value={form.contactNumber}
                onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
                placeholder="+1-555-0000"
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Safety Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.safetyScore}
                onChange={(e) => setForm((f) => ({ ...f, safetyScore: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DriverStatus }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="h-9 px-4 text-sm font-500 border border-input rounded-md bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-4 text-sm font-600 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors"
            >
              {editDriver ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg fade-in">
            <h3 className="text-base font-700 text-foreground mb-2">Delete Driver?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Remove <span className="font-600 text-foreground">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-9 px-4 text-sm font-500 border border-input rounded-md bg-card text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="h-9 px-4 text-sm font-600 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
