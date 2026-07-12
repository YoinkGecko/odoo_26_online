import { useEffect, useState } from 'react';
import { Wrench, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { maintenanceApi, vehicleApi, getVehicle } from '../api';
import { MaintenanceLog, Vehicle, Role, canWrite } from '../types';
import { Card, CardHeader, Table, Badge, Button, Field, Input, Select, Textarea, RuleError, RuleNote } from '../components/ui';
import { fmtCurrency, fmtDate, toDateInput, fromDateInput } from '../utils/format';

const SERVICE_TYPES = ['Oil Change', 'Brake Overhaul', 'Tire Rotation', 'Engine Repair', 'Transmission Service', 'Inspection', 'Bodywork', 'Electrical'];

export function Maintenance({ role }: { role: Role }) {
  const writable = canWrite(role, 'maintenance');
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const load = () => {
    const m = maintenanceApi.list();
    const v = vehicleApi.list();
    if (m.success && m.data) setLogs(m.data);
    if (v.success && v.data) setVehicles(v.data);
  };
  useEffect(load, []);

  const [form, setForm] = useState({ vehicleId: '', serviceType: 'Oil Change', cost: '', date: toDateInput(Date.now()), notes: '' });
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = maintenanceApi.create({
      vehicleId: form.vehicleId,
      serviceType: form.serviceType,
      cost: Number(form.cost) || 0,
      date: form.date ? fromDateInput(form.date) : Date.now(),
      notes: form.notes,
    });
    setLoading(false);
    if (res.success) {
      setForm({ ...form, cost: '', notes: '' });
      load();
    } else {
      setError(res.error ?? null);
    }
  };

  const close = (id: string) => { const r = maintenanceApi.close(id); if (r.success) load(); };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Maintenance</h1>
        <p className="text-sm text-ink-500 mt-0.5">Log service records and track vehicle shop status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {writable ? (
          <Card>
            <CardHeader title="Log Service Record" subtitle="Opening a record sends the vehicle In Shop" />
            <form onSubmit={submit} className="space-y-3">
              {error && <RuleError error={error} />}
              <Field label="Vehicle" required>
                <Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select vehicle…</option>
                  {vehicles.filter((v) => v.status !== 'RETIRED').map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.model} ({v.status.replace(/_/g, ' ').toLowerCase()})</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Service Type" required>
                  <Select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Cost ($)" required><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="450" required /></Field>
                <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              </div>
              <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Front brake pads worn below 2mm" /></Field>
              <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">Log Service Record</Button>
            </form>
          </Card>
        ) : (
          <Card><CardHeader title="Log Service Record" /><p className="text-sm text-ink-400">View-only access.</p></Card>
        )}

        <Card padded={false}>
          <div className="p-4 pb-2"><CardHeader title="Service Log" subtitle={`${logs.length} records`} /></div>
          <Table
            columns={[
              { key: 'vehicle', header: 'Vehicle', render: (m) => <span className="font-mono text-2xs">{getVehicle(m.vehicleId)?.regNo ?? '—'}</span> },
              { key: 'type', header: 'Service' },
              { key: 'cost', header: 'Cost', render: (m) => fmtCurrency(m.cost) },
              { key: 'date', header: 'Date', render: (m) => fmtDate(m.date) },
              { key: 'status', header: 'Status', render: (m) => <Badge tone={m.status === 'OPEN' ? 'warning' : 'success'}>{m.status === 'OPEN' ? 'Open' : 'Closed'}</Badge> },
              { key: 'action', header: '', render: (m) => writable && m.status === 'OPEN' ? <Button size="sm" variant="ghost" onClick={() => close(m.id)}>Close</Button> : null },
            ]}
            rows={logs}
          />
        </Card>
      </div>

      {/* State transition diagram */}
      <Card>
        <CardHeader title="Vehicle State Transition" subtitle="Triggered automatically by opening / closing a maintenance record" />
        <div className="flex items-center justify-center gap-6 py-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-28 h-16 border-2 border-success-border bg-success-soft rounded flex flex-col items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success-text mb-0.5" />
              <span className="text-2xs font-medium text-success-text">Available</span>
            </div>
            <span className="text-2xs text-ink-400">Vehicle roadworthy</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-5 h-5 text-ink-400" />
            <span className="text-2xs text-ink-500">Open record</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-28 h-16 border-2 border-warning-border bg-warning-soft rounded flex flex-col items-center justify-center">
              <Wrench className="w-4 h-4 text-warning-text mb-0.5" />
              <span className="text-2xs font-medium text-warning-text">In Shop</span>
            </div>
            <span className="text-2xs text-ink-400">Under maintenance</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowLeft className="w-5 h-5 text-ink-400" />
            <span className="text-2xs text-ink-500">Close record</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-28 h-16 border-2 border-ink-100 bg-ink-50 rounded flex flex-col items-center justify-center opacity-60">
              <span className="text-2xs font-medium text-ink-500">Retired</span>
              <span className="text-2xs text-ink-400">(no return)</span>
            </div>
            <span className="text-2xs text-ink-400">Terminal state</span>
          </div>
        </div>
        <p className="text-center text-2xs text-ink-500 italic mt-1">
          Opening a maintenance record flips the vehicle <span className="not-italic font-medium">Available → In Shop</span>.
          Closing it restores <span className="not-italic font-medium">In Shop → Available</span>, unless the vehicle is Retired.
        </p>
      </Card>

      <div>
        <RuleNote>Retired vehicles cannot enter maintenance — the record is rejected.</RuleNote>
      </div>
    </div>
  );
}
