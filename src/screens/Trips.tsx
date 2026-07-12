import { useEffect, useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { tripApi, vehicleApi, driverApi, getVehicle, getDriver } from '../api';
import { Trip, Vehicle, Driver, TripStatus, TRIP_STATUS_LABELS, TRIP_STEPS, Role, canWrite } from '../types';
import { Card, CardHeader, Badge, statusTone, Button, Field, Input, Select, RuleNote, RuleError } from '../components/ui';
import { fmtNumber, fmtDateTime, relativeTime } from '../utils/format';

export function Trips({ role }: { role: Role }) {
  const writable = canWrite(role, 'trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const load = () => {
    const t = tripApi.list();
    const v = vehicleApi.dispatchable();
    const d = driverApi.dispatchable();
    if (t.success && t.data) setTrips(t.data);
    if (v.success && v.data) setVehicles(v.data);
    if (d.success && d.data) setDrivers(d.data);
  };
  useEffect(load, []);

  const activeTrips = trips.filter((t) => t.status === 'DISPATCHED' || t.status === 'DRAFT');

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Trips</h1>
        <p className="text-sm text-ink-500 mt-0.5">Create trips, dispatch to available vehicles and drivers, track lifecycle.</p>
      </div>

      {/* Lifecycle stepper */}
      <Card>
        <CardHeader title="Trip Lifecycle" subtitle="Draft → Dispatched → Completed / Cancelled" />
        <div className="flex items-center gap-2 mt-2">
          {TRIP_STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded ${i === 1 ? 'border-brand-300 bg-brand-50' : 'border-ink-100 bg-white'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-warning-text' : i === 1 ? 'bg-info-text' : i === 2 ? 'bg-success-text' : 'bg-danger-text'}`} />
                <span className="text-2xs font-medium text-ink-700">{TRIP_STATUS_LABELS[step]}</span>
              </div>
              {i < TRIP_STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-ink-300 mx-1" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create Trip form */}
        {writable ? (
          <CreateTripForm vehicles={vehicles} drivers={drivers} onCreated={load} />
        ) : (
          <Card><CardHeader title="Create Trip" /><p className="text-sm text-ink-400">View-only access — trip creation disabled.</p></Card>
        )}

        {/* Live Board */}
        <Card padded={false}>
          <div className="p-4 pb-2">
            <CardHeader title="Live Board" subtitle={`${activeTrips.length} active trip${activeTrips.length === 1 ? '' : 's'}`} />
          </div>
          <div className="divide-y divide-ink-50">
            {activeTrips.length === 0 && <div className="px-4 py-8 text-center text-sm text-ink-400">No active trips.</div>}
            {activeTrips.map((trip) => {
              const v = getVehicle(trip.vehicleId);
              const d = getDriver(trip.driverId);
              return (
                <div
                  key={trip.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${selected === trip.id ? 'bg-brand-50' : 'hover:bg-ink-50/50'}`}
                  onClick={() => setSelected(selected === trip.id ? null : trip.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink-800 font-medium">{trip.source} → {trip.destination}</span>
                      <Badge tone={statusTone(trip.status)}>{TRIP_STATUS_LABELS[trip.status]}</Badge>
                    </div>
                    <span className="text-2xs text-ink-400">{relativeTime(trip.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-2xs text-ink-500">
                    <span className="font-mono">{v?.regNo ?? '—'}</span>
                    <span>{d?.name ?? '—'}</span>
                    <span>{fmtNumber(trip.cargoWeight)} kg</span>
                    {trip.status === 'DISPATCHED' && trip.dispatchedAt && <span>ETA {fmtDateTime(trip.dispatchedAt + 8 * 3600000)}</span>}
                  </div>
                  {selected === trip.id && writable && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-ink-100">
                      {trip.status === 'DRAFT' && <Button size="sm" variant="primary" icon={<ArrowRight className="w-3 h-3" />} onClick={(e) => { e.stopPropagation(); const r = tripApi.dispatch(trip.id); if (r.success) load(); }}>Dispatch</Button>}
                      {trip.status === 'DISPATCHED' && <Button size="sm" variant="primary" icon={<Check className="w-3 h-3" />} onClick={(e) => { e.stopPropagation(); const r = tripApi.complete(trip.id); if (r.success) load(); }}>Complete</Button>}
                      {(trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && <Button size="sm" variant="danger" icon={<X className="w-3 h-3" />} onClick={(e) => { e.stopPropagation(); const r = tripApi.cancel(trip.id); if (r.success) load(); }}>Cancel</Button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mb-2">
        <RuleNote>Cargo weight must not exceed the selected vehicle's max capacity — dispatch blocked on violation.</RuleNote>
      </div>

      {/* All trips table */}
      <Card padded={false}>
        <div className="p-4 pb-2"><CardHeader title="All Trips" subtitle={`${trips.length} total`} /></div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-ink-100">
                {['Route', 'Vehicle', 'Driver', 'Cargo', 'Distance', 'Status', 'Dispatched', 'Actions'].map((h) => (
                  <th key={h} className="text-left font-medium text-2xs uppercase tracking-wide text-ink-500 px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => {
                const v = getVehicle(trip.vehicleId);
                const d = getDriver(trip.driverId);
                return (
                  <tr key={trip.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                    <td className="px-3 py-2.5 text-ink-800">{trip.source} → {trip.destination}</td>
                    <td className="px-3 py-2.5 font-mono text-2xs text-ink-600">{v?.regNo ?? '—'}</td>
                    <td className="px-3 py-2.5">{d?.name ?? '—'}</td>
                    <td className="px-3 py-2.5">{fmtNumber(trip.cargoWeight)} kg</td>
                    <td className="px-3 py-2.5">{fmtNumber(trip.plannedDistance)} km</td>
                    <td className="px-3 py-2.5"><Badge tone={statusTone(trip.status)}>{TRIP_STATUS_LABELS[trip.status as TripStatus]}</Badge></td>
                    <td className="px-3 py-2.5 text-2xs text-ink-500">{trip.dispatchedAt ? fmtDateTime(trip.dispatchedAt) : '—'}</td>
                    <td className="px-3 py-2.5">
                      {writable && trip.status === 'DRAFT' && <Button size="sm" variant="ghost" onClick={() => { const r = tripApi.dispatch(trip.id); if (r.success) load(); }}>Dispatch</Button>}
                      {writable && trip.status === 'DISPATCHED' && <Button size="sm" variant="ghost" onClick={() => { const r = tripApi.complete(trip.id); if (r.success) load(); }}>Complete</Button>}
                      {writable && (trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && <Button size="sm" variant="ghost" onClick={() => { const r = tripApi.cancel(trip.id); if (r.success) load(); }}>Cancel</Button>}
                      {!writable && <span className="text-2xs text-ink-400">view-only</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CreateTripForm({ vehicles, drivers, onCreated }: { vehicles: Vehicle[]; drivers: Driver[]; onCreated: () => void }) {
  const [form, setForm] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = tripApi.create({
      source: form.source,
      destination: form.destination,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      cargoWeight: Number(form.cargoWeight),
      plannedDistance: Number(form.plannedDistance),
    });
    setLoading(false);
    if (res.success) {
      setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' });
      onCreated();
    } else {
      setError(res.error ?? null);
    }
  };

  return (
    <Card>
      <CardHeader title="Create Trip" subtitle="Vehicles & drivers filtered to available + valid" />
      <form onSubmit={submit} className="space-y-3">
        {error && <RuleError error={error} />}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source" required><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Nairobi" required /></Field>
          <Field label="Destination" required><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Mombasa" required /></Field>
          <Field label="Vehicle" required hint={selectedVehicle ? `Max capacity: ${fmtNumber(selectedVehicle.maxCapacity)} kg` : 'Available vehicles only'}>
            <Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.model} ({fmtNumber(v.maxCapacity)}kg)</option>)}
            </Select>
          </Field>
          <Field label="Driver" required hint="Available + valid license only">
            <Select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
              <option value="">Select driver…</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</option>)}
            </Select>
          </Field>
          <Field label="Cargo Weight (kg)" required><Input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} placeholder="18000" required /></Field>
          <Field label="Planned Distance (km)" required><Input type="number" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} placeholder="484" required /></Field>
        </div>
        <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">Create Draft Trip</Button>
      </form>
    </Card>
  );
}
