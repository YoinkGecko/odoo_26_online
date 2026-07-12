'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Vehicle, VehicleStatus } from '@/lib/types';
import { api } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

const VEHICLE_TYPES = ['Van', 'Truck', 'Pickup', 'Flatbed', 'Refrigerated'] as const;
const REGIONS = ['North', 'South', 'East', 'West'];
const STATUS_OPTIONS: VehicleStatus[] = ['Available', 'On Trip', 'In Shop', 'Retired'];

const EMPTY_FORM = {
  registrationNumber: '',
  name: '',
  type: 'Van' as Vehicle['type'],
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available' as VehicleStatus,
  region: 'North',
};

export default function VehicleRegistryContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Vehicle | null>(null);

  useEffect(() => {
    api.vehicles.list()
      .then(setVehicles)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = vehicles;
    if (statusFilter !== 'All') r = r.filter((v) => v.status === statusFilter);
    if (typeFilter !== 'All') r = r.filter((v) => v.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (v) =>
          v.registrationNumber.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          v.region.toLowerCase().includes(q)
      );
    }
    return r;
  }, [vehicles, statusFilter, typeFilter, search]);

  const openCreate = () => {
    setEditVehicle(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setForm({
      registrationNumber: v.registrationNumber,
      name: v.name,
      type: v.type,
      maxLoadCapacity: String(v.maxLoadCapacity),
      odometer: String(v.odometer),
      acquisitionCost: String(v.acquisitionCost),
      status: v.status,
      region: v.region,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.registrationNumber.trim() || !form.name.trim()) {
      setFormError('Registration number and vehicle name are required.');
      return;
    }
    if (!form.maxLoadCapacity || Number(form.maxLoadCapacity) <= 0) {
      setFormError('Max load capacity must be a positive number.');
      return;
    }

    const payload = {
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost) || 0,
      status: form.status,
      region: form.region,
    };

    try {
      if (editVehicle) {
        const updated = await api.vehicles.update(editVehicle.id, payload);
        setVehicles((prev) => prev.map((v) => (v.id === editVehicle.id ? updated : v)));
        toast.success('Vehicle updated');
      } else {
        const created = await api.vehicles.create(payload);
        setVehicles((prev) => [created, ...prev]);
        toast.success('Vehicle added');
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save vehicle');
    }
  };

  const handleDelete = async (v: Vehicle) => {
    try {
      await api.vehicles.delete(v.id);
      setVehicles((prev) => prev.filter((x) => x.id !== v.id));
      setDeleteConfirm(null);
      toast.success('Vehicle deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: vehicles.length };
    STATUS_OPTIONS.forEach((s) => {
      counts[s] = vehicles.filter((v) => v.status === s).length;
    });
    return counts;
  }, [vehicles]);

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vehicles.length} vehicles — {statusCounts['Available'] ?? 0} available, {statusCounts['In Shop'] ?? 0} in shop
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-600 rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="PlusIcon" size={16} />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reg#, name, region…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-sm border border-input rounded-md bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-60"
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 px-2 text-xs border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="All">All Types</option>
          {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Reg #', 'Vehicle Name', 'Type', 'Region', 'Max Load (kg)', 'Odometer (km)', 'Acq. Cost', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading vehicles…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No vehicles match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-600 text-foreground font-tabular">{v.registrationNumber}</td>
                    <td className="px-4 py-3 text-foreground">{v.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.region}</td>
                    <td className="px-4 py-3 text-right font-tabular text-foreground">{v.maxLoadCapacity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">{v.odometer.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit vehicle"
                        >
                          <Icon name="PencilIcon" size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(v)}
                          className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete vehicle"
                        >
                          <Icon name="TrashIcon" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              <label className="block text-xs font-600 text-muted-foreground mb-1">Registration Number *</label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                placeholder="e.g. TX-1234-Z"
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Vehicle Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ford Transit Van"
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Vehicle['type'] }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Max Load Capacity (kg) *</label>
              <input
                type="number"
                min="1"
                value={form.maxLoadCapacity}
                onChange={(e) => setForm((f) => ({ ...f, maxLoadCapacity: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={form.odometer}
                onChange={(e) => setForm((f) => ({ ...f, odometer: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Acquisition Cost ($)</label>
              <input
                type="number"
                min="0"
                value={form.acquisitionCost}
                onChange={(e) => setForm((f) => ({ ...f, acquisitionCost: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VehicleStatus }))}
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
              {editVehicle ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg fade-in">
            <h3 className="text-base font-700 text-foreground mb-2">Delete Vehicle?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Remove <span className="font-600 text-foreground">{deleteConfirm.registrationNumber}</span> — {deleteConfirm.name}? This action cannot be undone.
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
