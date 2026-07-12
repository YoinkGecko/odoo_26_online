'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { FuelLog, ExpenseLog } from '@/lib/types';
import { api } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';

type TabType = 'fuel' | 'expenses';
const EXPENSE_CATEGORIES = ['Toll', 'Parking', 'Repair', 'Cleaning', 'Other'] as const;

const EMPTY_FUEL_FORM = {
  vehicleId: '',
  tripId: '',
  date: '2026-07-12',
  liters: '',
  pricePerLiter: '',
  odometer: '',
  station: '',
};

const EMPTY_EXPENSE_FORM = {
  vehicleId: '',
  tripId: '',
  date: '2026-07-12',
  category: 'Toll' as ExpenseLog['category'],
  description: '',
  amount: '',
};

export default function FuelExpensesContent() {
  const [activeTab, setActiveTab] = useState<TabType>('fuel');
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [vehicles, setVehicles] = useState<Awaited<ReturnType<typeof api.vehicles.list>>>([]);
  const [loading, setLoading] = useState(true);

  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editFuel, setEditFuel] = useState<FuelLog | null>(null);
  const [editExpense, setEditExpense] = useState<ExpenseLog | null>(null);
  const [fuelForm, setFuelForm] = useState({ ...EMPTY_FUEL_FORM });
  const [expenseForm, setExpenseForm] = useState({ ...EMPTY_EXPENSE_FORM });
  const [fuelFormError, setFuelFormError] = useState('');
  const [expenseFormError, setExpenseFormError] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: TabType; id: string } | null>(null);

  useEffect(() => {
    Promise.all([api.fuelLogs.list(), api.expenses.list(), api.vehicles.list()])
      .then(([fuelData, expenseData, vehiclesData]) => {
        setFuelLogs(fuelData);
        setExpenses(expenseData);
        setVehicles(vehiclesData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ─── Computed totals ──────────────────────────────────────────────────────
  const totalFuelCost = useMemo(() => fuelLogs.reduce((s, l) => s + l.totalCost, 0), [fuelLogs]);
  const totalLiters = useMemo(() => fuelLogs.reduce((s, l) => s + l.liters, 0), [fuelLogs]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalOperationalCost = totalFuelCost + totalExpenses;

  const filteredFuel = useMemo(() => {
    if (vehicleFilter === 'All') return fuelLogs;
    return fuelLogs.filter((l) => l.vehicleId === vehicleFilter);
  }, [fuelLogs, vehicleFilter]);

  const filteredExpenses = useMemo(() => {
    if (vehicleFilter === 'All') return expenses;
    return expenses.filter((e) => e.vehicleId === vehicleFilter);
  }, [expenses, vehicleFilter]);

  // ─── Fuel CRUD ────────────────────────────────────────────────────────────
  const openCreateFuel = () => {
    setEditFuel(null);
    setFuelForm({ ...EMPTY_FUEL_FORM });
    setFuelFormError('');
    setFuelModalOpen(true);
  };

  const openEditFuel = (log: FuelLog) => {
    setEditFuel(log);
    setFuelForm({
      vehicleId: log.vehicleId,
      tripId: log.tripId ?? '',
      date: log.date,
      liters: String(log.liters),
      pricePerLiter: String(log.pricePerLiter),
      odometer: String(log.odometer),
      station: log.station,
    });
    setFuelFormError('');
    setFuelModalOpen(true);
  };

  const handleSaveFuel = async () => {
    if (!fuelForm.vehicleId) { setFuelFormError('Please select a vehicle.'); return; }
    if (!fuelForm.liters || Number(fuelForm.liters) <= 0) { setFuelFormError('Liters must be a positive number.'); return; }
    if (!fuelForm.pricePerLiter || Number(fuelForm.pricePerLiter) <= 0) { setFuelFormError('Price per liter must be a positive number.'); return; }

    const payload = {
      vehicleId: fuelForm.vehicleId,
      tripId: fuelForm.tripId || undefined,
      date: fuelForm.date,
      liters: Number(fuelForm.liters),
      pricePerLiter: Number(fuelForm.pricePerLiter),
      odometer: Number(fuelForm.odometer) || 0,
      station: fuelForm.station,
    };

    try {
      if (editFuel) {
        const updated = await api.fuelLogs.update(editFuel.id, payload);
        setFuelLogs((prev) => prev.map((l) => (l.id === editFuel.id ? updated : l)));
        toast.success('Fuel log updated');
      } else {
        const created = await api.fuelLogs.create(payload);
        setFuelLogs((prev) => [created, ...prev]);
        toast.success('Fuel log added');
      }
      setFuelModalOpen(false);
    } catch (err) {
      setFuelFormError(err instanceof Error ? err.message : 'Failed to save fuel log');
    }
  };

  // ─── Expense CRUD ─────────────────────────────────────────────────────────
  const openCreateExpense = () => {
    setEditExpense(null);
    setExpenseForm({ ...EMPTY_EXPENSE_FORM });
    setExpenseFormError('');
    setExpenseModalOpen(true);
  };

  const openEditExpense = (exp: ExpenseLog) => {
    setEditExpense(exp);
    setExpenseForm({
      vehicleId: exp.vehicleId,
      tripId: exp.tripId ?? '',
      date: exp.date,
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
    });
    setExpenseFormError('');
    setExpenseModalOpen(true);
  };

  const handleSaveExpense = async () => {
    if (!expenseForm.vehicleId) { setExpenseFormError('Please select a vehicle.'); return; }
    if (!expenseForm.description.trim()) { setExpenseFormError('Description is required.'); return; }
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) { setExpenseFormError('Amount must be a positive number.'); return; }

    const payload = {
      vehicleId: expenseForm.vehicleId,
      tripId: expenseForm.tripId || undefined,
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: Number(expenseForm.amount),
    };

    try {
      if (editExpense) {
        const updated = await api.expenses.update(editExpense.id, payload);
        setExpenses((prev) => prev.map((e) => (e.id === editExpense.id ? updated : e)));
        toast.success('Expense updated');
      } else {
        const created = await api.expenses.create(payload);
        setExpenses((prev) => [created, ...prev]);
        toast.success('Expense added');
      }
      setExpenseModalOpen(false);
    } catch (err) {
      setExpenseFormError(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'fuel') {
        await api.fuelLogs.delete(deleteConfirm.id);
        setFuelLogs((prev) => prev.filter((l) => l.id !== deleteConfirm.id));
      } else {
        await api.expenses.delete(deleteConfirm.id);
        setExpenses((prev) => prev.filter((e) => e.id !== deleteConfirm.id));
      }
      toast.success('Record deleted');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const inputCls = 'w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Fuel & Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Total operational cost: <span className="font-600 text-foreground">${totalOperationalCost.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={activeTab === 'fuel' ? openCreateFuel : openCreateExpense}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-600 rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="PlusIcon" size={16} />
          {activeTab === 'fuel' ? 'Log Fuel' : 'Log Expense'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Fuel Cost', value: `$${totalFuelCost.toFixed(2)}`, sub: `${totalLiters.toFixed(1)} L total` },
          { label: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}`, sub: `${expenses.length} records` },
          { label: 'Operational Cost', value: `$${totalOperationalCost.toFixed(2)}`, sub: 'Fuel + expenses' },
          { label: 'Avg Cost / Fuel Log', value: fuelLogs.length ? `$${(totalFuelCost / fuelLogs.length).toFixed(2)}` : '—', sub: `${fuelLogs.length} fuel logs` },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
            <p className="text-2xl font-700 font-tabular text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs + filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['fuel', 'expenses'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-500 rounded-md transition-colors capitalize ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'fuel' ? 'Fuel Logs' : 'Expense Logs'}
            </button>
          ))}
        </div>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="h-8 px-2 text-xs border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="All">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
          ))}
        </select>
      </div>

      {/* Fuel Logs Table */}
      {activeTab === 'fuel' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Vehicle', 'Trip', 'Date', 'Liters', 'Price/L', 'Total Cost', 'Odometer', 'Station', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading fuel logs…</td></tr>
                ) : filteredFuel.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No fuel logs found.</td></tr>
                ) : filteredFuel.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-600 text-foreground font-tabular">{log.vehicleReg}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{log.tripId ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{log.date}</td>
                    <td className="px-4 py-3 text-right font-tabular text-foreground">{log.liters.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">${log.pricePerLiter.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-tabular font-600 text-foreground">${log.totalCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">{log.odometer.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{log.station}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditFuel(log)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Icon name="PencilIcon" size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'fuel', id: log.id })} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Delete">
                          <Icon name="TrashIcon" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Logs Table */}
      {activeTab === 'expenses' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Vehicle', 'Trip', 'Date', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Loading expenses…</td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No expense logs found.</td></tr>
                ) : filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-600 text-foreground font-tabular">{exp.vehicleReg}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{exp.tripId ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{exp.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full text-[11px] font-500 px-2 py-0.5 border bg-slate-50 text-slate-600 border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{exp.description}</td>
                    <td className="px-4 py-3 text-right font-tabular font-600 text-foreground">${exp.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditExpense(exp)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Icon name="PencilIcon" size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'expenses', id: exp.id })} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors" title="Delete">
                          <Icon name="TrashIcon" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title={editFuel ? 'Edit Fuel Log' : 'Log Fuel'} size="md">
        <div className="space-y-4">
          {fuelFormError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{fuelFormError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Vehicle *</label>
              <select value={fuelForm.vehicleId} onChange={(e) => setFuelForm((f) => ({ ...f, vehicleId: e.target.value }))} className={inputCls}>
                <option value="">Select vehicle…</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date</label>
              <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Trip ID (optional)</label>
              <input type="text" value={fuelForm.tripId} onChange={(e) => setFuelForm((f) => ({ ...f, tripId: e.target.value }))} placeholder="e.g. trip-001" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Liters *</label>
              <input type="number" min="0" step="0.1" value={fuelForm.liters} onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Price per Liter ($) *</label>
              <input type="number" min="0" step="0.01" value={fuelForm.pricePerLiter} onChange={(e) => setFuelForm((f) => ({ ...f, pricePerLiter: e.target.value }))} className={inputCls} />
            </div>
            {fuelForm.liters && fuelForm.pricePerLiter && (
              <div className="col-span-2 bg-accent rounded-md px-3 py-2 text-sm">
                <span className="text-muted-foreground">Computed total cost: </span>
                <span className="font-700 text-primary">${(Number(fuelForm.liters) * Number(fuelForm.pricePerLiter)).toFixed(2)}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Odometer (km)</label>
              <input type="number" min="0" value={fuelForm.odometer} onChange={(e) => setFuelForm((f) => ({ ...f, odometer: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Station</label>
              <input type="text" value={fuelForm.station} onChange={(e) => setFuelForm((f) => ({ ...f, station: e.target.value }))} placeholder="e.g. Shell — Chicago, IL" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setFuelModalOpen(false)} className="h-9 px-4 text-sm font-500 border border-input rounded-md bg-card text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSaveFuel} className="h-9 px-4 text-sm font-600 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors">{editFuel ? 'Save Changes' : 'Log Fuel'}</button>
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title={editExpense ? 'Edit Expense' : 'Log Expense'} size="md">
        <div className="space-y-4">
          {expenseFormError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{expenseFormError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Vehicle *</label>
              <select value={expenseForm.vehicleId} onChange={(e) => setExpenseForm((f) => ({ ...f, vehicleId: e.target.value }))} className={inputCls}>
                <option value="">Select vehicle…</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Date</label>
              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Category</label>
              <select value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value as ExpenseLog['category'] }))} className={inputCls}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Trip ID (optional)</label>
              <input type="text" value={expenseForm.tripId} onChange={(e) => setExpenseForm((f) => ({ ...f, tripId: e.target.value }))} placeholder="e.g. trip-001" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1">Amount ($) *</label>
              <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-600 text-muted-foreground mb-1">Description *</label>
              <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of the expense" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setExpenseModalOpen(false)} className="h-9 px-4 text-sm font-500 border border-input rounded-md bg-card text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSaveExpense} className="h-9 px-4 text-sm font-600 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors">{editExpense ? 'Save Changes' : 'Log Expense'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg fade-in">
            <h3 className="text-base font-700 text-foreground mb-2">Delete Record?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="h-9 px-4 text-sm font-500 border border-input rounded-md bg-card text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} className="h-9 px-4 text-sm font-600 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
