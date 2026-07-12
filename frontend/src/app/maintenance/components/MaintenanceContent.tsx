'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceLog, Vehicle, VehicleStatus } from '@/lib/types';
import { api } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';

import Modal from '@/components/ui/Modal';

const MAINTENANCE_TYPES = ['Oil Change', 'Brake Service', 'Tire Replacement', 'Engine Repair', 'AC Service', 'Electrical', 'Body Work', 'Inspection', 'Other'];

const EMPTY_FORM = {
  vehicleId: '',
  type: 'Oil Change',
  description: '',
  openedAt: '2026-07-12',
  cost: '',
};

export default function MaintenanceContent() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<MaintenanceLog | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceLog | null>(null);

  useEffect(() => {
    Promise.all([api.maintenance.list(), api.vehicles.list()])
      .then(([logsData, vehiclesData]) => {
        setLogs(logsData);
        setVehicles(vehiclesData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = logs;
    if (statusFilter !== 'All') r = r.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (l) =>
          l.vehicleReg.toLowerCase().includes(q) ||
          l.vehicleName.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    return r;
  }, [logs, statusFilter, search]);

  const openCreate = () => {
    setEditLog(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (log: MaintenanceLog) => {
    setEditLog(log);
    setForm({
      vehicleId: log.vehicleId,
      type: log.type,
      description: log.description,
      openedAt: log.openedAt,
      cost: String(log.cost),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.vehicleId) {
      setFormError('Please select a vehicle.');
      return;
    }
    if (!form.description.trim()) {
      setFormError('Description is required.');
      return;
    }

    const payload = {
      vehicleId: form.vehicleId,
      type: form.type,
      description: form.description.trim(),
      openedAt: form.openedAt,
      cost: Number(form.cost) || 0,
    };

    try {
      if (editLog) {
        const updated = await api.maintenance.update(editLog.id, payload);
        setLogs((prev) => prev.map((l) => (l.id === editLog.id ? updated : l)));
        toast.success('Maintenance record updated');
      } else {
        const created = await api.maintenance.create(payload);
        setLogs((prev) => [created, ...prev]);
        setVehicles((prev) =>
          prev.map((v) => (v.id === form.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v))
        );
        toast.success('Maintenance record opened');
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleClose = async (log: MaintenanceLog) => {
    try {
      const updated = await api.maintenance.close(log.id);
      setLogs((prev) => prev.map((l) => (l.id === log.id ? updated : l)));
      setVehicles((prev) =>
        prev.map((v) => (v.id === log.vehicleId ? { ...v, status: 'Available' as VehicleStatus } : v))
      );
      toast.success('Maintenance record closed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close record');
    }
  };

  const handleDelete = async (log: MaintenanceLog) => {
    try {
      await api.maintenance.delete(log.id);
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
      setDeleteConfirm(null);
      toast.success('Maintenance record deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const openCount = logs.filter((l) => l.status === 'Open').length;
  const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);

  // Only show available/in-shop vehicles for new log (not On Trip or Retired)
  const eligibleVehicles = vehicles.filter((v) => v.status !== 'On Trip' && v.status !== 'Retired');

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Maintenance Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {logs.length} total records — {openCount} open, ${totalCost.toLocaleString()} total cost
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-600 rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="PlusIcon" size={16} />
          Log Maintenance
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Records', value: openCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Closed Records', value: logs.filter((l) => l.status === 'Closed').length, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          { label: 'Total Cost', value: `$${totalCost.toLocaleString()}`, color: 'text-foreground', bg: 'bg-card border-border' },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
            <p className={`text-2xl font-700 font-tabular ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vehicle, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-sm border border-input rounded-md bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-56"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['All', 'Open', 'Closed'] as const).map((s) => (
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
              <span className="ml-1.5 opacity-70">
                {s === 'All' ? logs.length : logs.filter((l) => l.status === s).length}
              </span>
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
                {['Vehicle', 'Type', 'Description', 'Opened', 'Closed', 'Cost', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading maintenance records…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No maintenance records match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-600 text-foreground font-tabular">{log.vehicleReg}</p>
                        <p className="text-xs text-muted-foreground">{log.vehicleName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.type}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{log.description}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{log.openedAt}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{log.closedAt ?? '—'}</td>
                    <td className="px-4 py-3 font-tabular text-foreground">${log.cost.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full text-[11px] font-500 px-2 py-0.5 border ${
                        log.status === 'Open' ?'bg-amber-50 text-amber-700 border-amber-200' :'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {log.status === 'Open' && (
                          <button
                            onClick={() => handleClose(log)}
                            className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                            title="Close record — vehicle returns to Available"
                          >
                            <Icon name="CheckCircleIcon" size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(log)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit record"
                        >
                          <Icon name="PencilIcon" size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(log)}
                          className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete record"
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
        title={editLog ? 'Edit Maintenance Record' : 'Log Maintenance'}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {formError}
            </div>
          )}
          {!editLog && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
              <Icon name="InformationCircleIcon" size={14} className="flex-shrink-0 mt-0.5" />
              Opening a new maintenance record will automatically set the vehicle status to <strong>In Shop</strong>.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Vehicle *</label>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                disabled={!!editLog}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
              >
                <option value="">Select vehicle…</option>
                {eligibleVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Maintenance Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date Opened</label>
              <input
                type="date"
                value={form.openedAt}
                onChange={(e) => setForm((f) => ({ ...f, openedAt: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Describe the maintenance work…"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
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
              {editLog ? 'Save Changes' : 'Open Record'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg fade-in">
            <h3 className="text-base font-700 text-foreground mb-2">Delete Record?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Remove maintenance record for <span className="font-600 text-foreground">{deleteConfirm.vehicleReg}</span>? This cannot be undone.
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
