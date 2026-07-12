import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { driverApi } from '../api';
import { Driver, DriverCategory, DriverStatus, DRIVER_STATUS_LABELS, Role, canWrite } from '../types';
import { Card, Table, Badge, statusTone, FilterBar, Button, Field, Input, Select, RuleNote, RuleError } from '../components/ui';
import { fromDateInput } from '../utils/format';

const CATEGORIES: DriverCategory[] = ['A', 'B', 'C', 'C+E'];

export function Drivers({ role }: { role: Role }) {
  const writable = canWrite(role, 'drivers');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    const res = driverApi.list();
    if (res.success && res.data) setDrivers(res.data);
  };
  useEffect(load, []);

  const filtered = drivers.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.licenseNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (chip && d.status !== chip) return false;
    return true;
  });

  const chips: Array<{ label: string; value: string; active: boolean; onClick: () => void }> = [
    { label: 'All', value: '', active: chip === '', onClick: () => setChip('') },
    ...Object.entries(DRIVER_STATUS_LABELS).map(([value, label]) => ({ label, value, active: chip === value, onClick: () => setChip(value) })),
  ];

  const isExpired = (d: Driver) => d.licenseExpiry <= Date.now();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Drivers</h1>
        <p className="text-sm text-ink-500 mt-0.5">{writable ? 'Manage driver records and assignments.' : 'View driver roster.'}</p>
      </div>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search name, license no…' }}
        chips={chips}
        right={writable && <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAdd(true)}>Add Driver</Button>}
      />

      <div className="mb-2">
        <RuleNote>Expired license or Suspended status blocks trip assignment.</RuleNote>
      </div>

      <Card padded={false}>
        <Table
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'licenseNo', header: 'License No', render: (d) => <span className="font-mono text-2xs">{d.licenseNo}</span> },
            { key: 'category', header: 'Category', render: (d) => <span className="font-mono text-2xs">{d.licenseCategory}</span> },
            { key: 'expiry', header: 'Expiry', render: (d) => <span className={isExpired(d) ? 'text-danger-text font-medium' : 'text-ink-700'}>{new Date(d.licenseExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}{isExpired(d) && ' · expired'}</span> },
            { key: 'contact', header: 'Contact', render: (d) => <span className="text-2xs text-ink-600">{d.contact}</span> },
            { key: 'completion', header: 'Trip Completion %', render: (d) => <span>{88 + (d.safetyScore % 10)}%</span> },
            { key: 'safety', header: 'Safety Score', render: (d) => {
              const tone = d.safetyScore >= 85 ? 'text-success-text' : d.safetyScore >= 75 ? 'text-warning-text' : 'text-danger-text';
              return <span className={`font-medium ${tone}`}>{d.safetyScore}</span>;
            } },
            { key: 'status', header: 'Status', render: (d) => <Badge tone={statusTone(d.status)}>{DRIVER_STATUS_LABELS[d.status as DriverStatus]}</Badge> },
          ]}
          rows={filtered}
        />
      </Card>

      {showAdd && writable && <AddDriverModal onClose={() => setShowAdd(false)} onCreated={() => { load(); setShowAdd(false); }} />}
    </div>
  );
}

function AddDriverModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', licenseNo: '', licenseCategory: 'C' as DriverCategory, licenseExpiry: '', contact: '', safetyScore: '85' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = driverApi.create({
      name: form.name,
      licenseNo: form.licenseNo,
      licenseCategory: form.licenseCategory,
      licenseExpiry: form.licenseExpiry ? fromDateInput(form.licenseExpiry) : Date.now() + 365 * 86400000,
      contact: form.contact,
      safetyScore: Number(form.safetyScore) || 80,
    });
    setLoading(false);
    if (res.success) onCreated();
    else setError(res.error ?? null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white border border-ink-100 rounded" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-ink-100">
          <h2 className="text-sm font-medium text-ink-900">Add Driver</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          {error && <RuleError error={error} />}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="License No" required><Input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="DL-44716" required /></Field>
            <Field label="License Category" required><Select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value as DriverCategory })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
            <Field label="License Expiry"><Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} /></Field>
            <Field label="Contact"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+254 712 000 000" /></Field>
            <Field label="Safety Score" hint="0–100"><Input type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>Add Driver</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
