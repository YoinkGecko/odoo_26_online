import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { vehicleApi } from '../api';
import { Vehicle, VehicleType, VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS, Role, canWrite } from '../types';
import { Card, Table, Badge, statusTone, FilterBar, Button, Field, Input, Select, RuleNote, RuleError } from '../components/ui';
import { fmtCurrency, fmtNumber } from '../utils/format';

const TYPES = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUSES = Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function Fleet({ role }: { role: Role }) {
  const writable = canWrite(role, 'fleet');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    const res = vehicleApi.list();
    if (res.success && res.data) setVehicles(res.data);
  };
  useEffect(load, []);

  const filtered = vehicles.filter((v) => {
    if (search && !v.regNo.toLowerCase().includes(search.toLowerCase()) && !v.model.toLowerCase().includes(search.toLowerCase())) return false;
    if (type && v.type !== type) return false;
    if (status && v.status !== status) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-ink-900">Fleet</h1>
          <p className="text-sm text-ink-500 mt-0.5">{writable ? 'Manage and register vehicles.' : 'View fleet inventory.'}</p>
        </div>
      </div>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search reg no, model…' }}
        selects={[
          { label: 'Type', value: type, onChange: setType, options: TYPES },
          { label: 'Status', value: status, onChange: setStatus, options: STATUSES },
        ]}
        right={writable && <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAdd(true)}>Add Vehicle</Button>}
      />

      <div className="mb-2">
        <RuleNote>Retired/In Shop vehicles are hidden from dispatch selection.</RuleNote>
      </div>

      <Card padded={false}>
        <Table
          columns={[
            { key: 'regNo', header: 'Reg No', render: (v) => <span className="font-mono text-2xs text-ink-700">{v.regNo}</span> },
            { key: 'model', header: 'Model' },
            { key: 'type', header: 'Type', render: (v) => VEHICLE_TYPE_LABELS[v.type as VehicleType] },
            { key: 'capacity', header: 'Capacity', render: (v) => `${fmtNumber(v.maxCapacity)} kg` },
            { key: 'odometer', header: 'Odometer', render: (v) => `${fmtNumber(v.odometer)} km` },
            { key: 'cost', header: 'Acquisition', render: (v) => fmtCurrency(v.acquisitionCost) },
            { key: 'status', header: 'Status', render: (v) => <Badge tone={statusTone(v.status)}>{VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}</Badge> },
          ]}
          rows={filtered}
        />
      </Card>

      {showAdd && writable && <AddVehicleModal onClose={() => setShowAdd(false)} onCreated={() => { load(); setShowAdd(false); }} />}
    </div>
  );
}

function AddVehicleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ regNo: '', model: '', type: 'TRUCK' as VehicleType, maxCapacity: '', odometer: '', acquisitionCost: '', region: 'North' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = vehicleApi.create({
      regNo: form.regNo,
      model: form.model,
      type: form.type,
      maxCapacity: Number(form.maxCapacity),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost) || 0,
      region: form.region,
    });
    setLoading(false);
    if (res.success) onCreated();
    else setError(res.error ?? null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white border border-ink-100 rounded" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-ink-100">
          <h2 className="text-sm font-medium text-ink-900">Register Vehicle</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          {error && <RuleError error={error} />}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration No" required><Input value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} placeholder="TRK-7784" required /></Field>
            <Field label="Model" required><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Volvo FH16" required /></Field>
            <Field label="Type" required><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></Field>
            <Field label="Region"><Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}><option>North</option><option>South</option><option>East</option><option>West</option><option>Central</option></Select></Field>
            <Field label="Max Capacity (kg)" required><Input type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} placeholder="24000" required /></Field>
            <Field label="Odometer (km)"><Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="0" /></Field>
            <Field label="Acquisition Cost ($)"><Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} placeholder="145000" /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>Register Vehicle</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
