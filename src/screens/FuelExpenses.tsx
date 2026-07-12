import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { fuelApi, expenseApi, maintenanceApi, vehicleApi, tripApi, getVehicle, getTrip } from '../api';
import { FuelLog, Expense, Vehicle, Trip, ExpenseType, Role, canWrite } from '../types';
import { Card, CardHeader, Table, Button, Field, Input, Select, RuleError } from '../components/ui';
import { fmtCurrency, fmtDate, toDateInput, fromDateInput } from '../utils/format';

export function FuelExpenses({ role }: { role: Role }) {
  const writable = canWrite(role, 'fuel-expenses');
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintCost, setMaintCost] = useState(0);
  const [showFuel, setShowFuel] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const load = () => {
    const f = fuelApi.list(); if (f.success && f.data) setFuelLogs(f.data);
    const e = expenseApi.list(); if (e.success && e.data) setExpenses(e.data);
    const v = vehicleApi.list(); if (v.success && v.data) setVehicles(v.data);
    const t = tripApi.list(); if (t.success && t.data) setTrips(t.data);
    const m = maintenanceApi.list(); if (m.success && m.data) setMaintCost(m.data.reduce((a, b) => a + b.cost, 0));
  };
  useEffect(load, []);

  const fuelCost = fuelLogs.reduce((a, b) => a + b.cost, 0);
  const expenseCost = expenses.reduce((a, b) => a + b.amount, 0);
  const totalOpCost = fuelCost + maintCost + expenseCost;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Fuel & Expenses</h1>
        <p className="text-sm text-ink-500 mt-0.5">Log fuel and operational expenses. Total cost rolls up below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padded={false}>
          <div className="p-4 pb-2 flex items-center justify-between">
            <CardHeader title="Fuel Logs" subtitle={`${fuelLogs.length} entries`} />
            {writable && <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowFuel(true)}>Log Fuel</Button>}
          </div>
          <Table
            columns={[
              { key: 'vehicle', header: 'Vehicle', render: (f) => <span className="font-mono text-2xs">{getVehicle(f.vehicleId)?.regNo ?? '—'}</span> },
              { key: 'date', header: 'Date', render: (f) => fmtDate(f.date) },
              { key: 'liters', header: 'Liters', render: (f) => `${f.liters} L` },
              { key: 'cost', header: 'Cost', render: (f) => fmtCurrency(f.cost) },
            ]}
            rows={fuelLogs}
          />
        </Card>

        <Card padded={false}>
          <div className="p-4 pb-2 flex items-center justify-between">
            <CardHeader title="Expenses" subtitle={`${expenses.length} entries`} />
            {writable && <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowExpense(true)}>Add Expense</Button>}
          </div>
          <Table
            columns={[
              { key: 'trip', header: 'Trip', render: (e) => { const t = e.tripId ? getTrip(e.tripId) : null; return t ? <span className="text-2xs">{t.source}→{t.destination}</span> : <span className="text-ink-300">—</span>; } },
              { key: 'vehicle', header: 'Vehicle', render: (e) => e.vehicleId ? <span className="font-mono text-2xs">{getVehicle(e.vehicleId)?.regNo ?? '—'}</span> : <span className="text-ink-300">—</span> },
              { key: 'type', header: 'Type', render: (e) => <span className="text-2xs">{e.type.toLowerCase()}</span> },
              { key: 'desc', header: 'Description', render: (e) => <span className="text-2xs text-ink-600">{e.description}</span> },
              { key: 'amount', header: 'Amount', render: (e) => fmtCurrency(e.amount) },
            ]}
            rows={expenses}
          />
        </Card>
      </div>

      {/* Total operational cost footer */}
      <Card>
        <CardHeader title="Total Operational Cost" subtitle="Fuel + Maintenance + Other Expenses" />
        <div className="grid grid-cols-4 gap-3 mt-2">
          <CostBox label="Fuel" value={fuelCost} />
          <CostBox label="Maintenance" value={maintCost} />
          <CostBox label="Other Expenses" value={expenseCost} />
          <CostBox label="Total" value={totalOpCost} highlight />
        </div>
      </Card>

      {showFuel && writable && <FuelModal vehicles={vehicles} onClose={() => setShowFuel(false)} onCreated={() => { load(); setShowFuel(false); }} />}
      {showExpense && writable && <ExpenseModal vehicles={vehicles} trips={trips} onClose={() => setShowExpense(false)} onCreated={() => { load(); setShowExpense(false); }} />}
    </div>
  );
}

function CostBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`p-3 border rounded ${highlight ? 'border-brand-300 bg-brand-50' : 'border-ink-100 bg-white'}`}>
      <div className="text-2xs font-medium text-ink-500 uppercase tracking-wide">{label}</div>
      <div className={`text-xl font-medium mt-1 ${highlight ? 'text-brand-700' : 'text-ink-900'}`}>{fmtCurrency(value)}</div>
    </div>
  );
}

function FuelModal({ vehicles, onClose, onCreated }: { vehicles: Vehicle[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ vehicleId: '', date: toDateInput(Date.now()), liters: '', cost: '' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = fuelApi.create({ vehicleId: form.vehicleId, date: fromDateInput(form.date), liters: Number(form.liters), cost: Number(form.cost) });
    setLoading(false);
    if (res.success) onCreated();
    else setError(res.error ?? null);
  };

  return (
    <Modal title="Log Fuel" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <RuleError error={error} />}
        <Field label="Vehicle" required><Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required><option value="">Select…</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.model}</option>)}</Select></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Liters" required><Input type="number" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} required /></Field>
          <Field label="Cost ($)" required><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" size="md" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="md" loading={loading}>Log Fuel</Button></div>
      </form>
    </Modal>
  );
}

function ExpenseModal({ vehicles, trips, onClose, onCreated }: { vehicles: Vehicle[]; trips: Trip[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ tripId: '', vehicleId: '', type: 'TOLL' as ExpenseType, amount: '', date: toDateInput(Date.now()), description: '' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = expenseApi.create({ tripId: form.tripId || null, vehicleId: form.vehicleId || null, type: form.type, amount: Number(form.amount), date: fromDateInput(form.date), description: form.description });
    setLoading(false);
    if (res.success) onCreated();
    else setError(res.error ?? null);
  };

  return (
    <Modal title="Add Expense" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <RuleError error={error} />}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trip (optional)"><Select value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })}><option value="">—</option>{trips.map((t) => <option key={t.id} value={t.id}>{t.source}→{t.destination}</option>)}</Select></Field>
          <Field label="Vehicle (optional)"><Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}><option value="">—</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo}</option>)}</Select></Field>
          <Field label="Type" required><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExpenseType })}><option value="TOLL">Toll</option><option value="MISC">Misc</option></Select></Field>
          <Field label="Amount ($)" required><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Toll fees" /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" size="md" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="md" loading={loading}>Add Expense</Button></div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink-900/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white border border-ink-100 rounded" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-12 border-b border-ink-100">
          <h2 className="text-sm font-medium text-ink-900">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
