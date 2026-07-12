'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Trip, TripStatus } from '@/lib/types';
import { api } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import CreateTripForm from './CreateTripForm';
import TripDetailPanel from './TripDetailPanel';
import ConfirmModal from './ConfirmModal';

type SortField = 'id' | 'source' | 'vehicleReg' | 'driverName' | 'cargoWeight' | 'plannedDistance' | 'status' | 'createdAt' | 'eta';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: { label: string; value: TripStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export default function TripManagementContent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Awaited<ReturnType<typeof api.vehicles.list>>>([]);
  const [drivers, setDrivers] = useState<Awaited<ReturnType<typeof api.drivers.list>>>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<TripStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'dispatch' | 'complete' | 'cancel' | 'delete';
    trip: Trip;
  } | null>(null);

  useEffect(() => {
    Promise.all([api.trips.list(), api.vehicles.list(), api.drivers.list()])
      .then(([tripsData, vehiclesData, driversData]) => {
        setTrips(tripsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ─── Filter + sort ────────────────────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    let result = trips;
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.vehicleReg.toLowerCase().includes(q) ||
          t.driverName.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const av = a[sortField as keyof Trip] as string | number;
      const bv = b[sortField as keyof Trip] as string | number;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [trips, statusFilter, searchQuery, sortField, sortDir]);

  // ─── Sort toggle ─────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ─── Selection ───────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTrips.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTrips.map((t) => t.id)));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Status transitions ──────────────────────────────────────────────────
  const executeAction = async (type: 'dispatch' | 'complete' | 'cancel' | 'delete', trip: Trip) => {
    try {
      let updated: Trip;
      if (type === 'dispatch') {
        updated = await api.trips.dispatch(trip.id);
        toast.success(`Trip ${trip.id.toUpperCase()} dispatched — vehicle & driver set to On Trip`);
      } else if (type === 'complete') {
        updated = await api.trips.complete(trip.id);
        toast.success(`Trip ${trip.id.toUpperCase()} completed — vehicle & driver restored to Available`);
      } else if (type === 'cancel') {
        updated = await api.trips.cancel(trip.id);
        toast.info(`Trip ${trip.id.toUpperCase()} cancelled`);
      } else {
        await api.trips.delete(trip.id);
        setTrips((prev) => prev.filter((t) => t.id !== trip.id));
        toast.success('Trip record deleted');
        setConfirmAction(null);
        return;
      }
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? updated : t)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
    setConfirmAction(null);
  };

  // ─── Create trip ─────────────────────────────────────────────────────────
  const handleCreateTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setCreateOpen(false);
    toast.success(`Trip ${newTrip.id.toUpperCase()} created — ready to dispatch`);
  };

  // ─── Bulk delete ─────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => api.trips.delete(id)));
      setTrips((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      toast.success(`${selectedIds.size} trip records deleted`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete trips');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <Icon name="ChevronUpDownIcon" size={13} className="text-muted-foreground opacity-40" />;
    return (
      <Icon
        name={sortDir === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
        size={13}
        className="text-primary"
      />
    );
  };

  const COLUMNS: { label: string; field: SortField; className?: string }[] = [
    { label: 'Trip ID', field: 'id', className: 'w-28' },
    { label: 'Route', field: 'source', className: 'min-w-[200px]' },
    { label: 'Vehicle', field: 'vehicleReg', className: 'w-32' },
    { label: 'Driver', field: 'driverName', className: 'min-w-[140px]' },
    { label: 'Cargo (kg)', field: 'cargoWeight', className: 'w-28 text-right' },
    { label: 'Distance', field: 'plannedDistance', className: 'w-24 text-right' },
    { label: 'Status', field: 'status', className: 'w-28' },
    { label: 'Created', field: 'createdAt', className: 'w-28' },
    { label: 'ETA', field: 'eta', className: 'w-28' },
  ];

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Trip Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {trips.length} total trips — {trips.filter((t) => t.status === 'Dispatched').length} active
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground text-sm font-600 rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="PlusIcon" size={16} />
          Create Trip
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trips, vehicles, drivers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-3 text-sm border border-input rounded-md bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={`sf-${f.value}`}
              onClick={() => setStatusFilter(f.value)}
              className={`h-8 px-3 text-xs font-500 rounded-md border transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-input hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
              {f.value !== 'All' && (
                <span className="ml-1.5 opacity-70">
                  {trips.filter((t) => t.status === f.value).length}
                </span>
              )}
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
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTrips.length && filteredTrips.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-input accent-primary cursor-pointer"
                    aria-label="Select all trips"
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={`th-${col.field}`}
                    className={`px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-foreground select-none ${col.className ?? ''}`}
                    onClick={() => handleSort(col.field)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-600 text-muted-foreground uppercase tracking-wide w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    Loading trips…
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Icon name="MapIcon" size={32} className="text-muted-foreground opacity-40" />
                      <div>
                        <p className="text-sm font-500 text-foreground">No trips found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchQuery || statusFilter !== 'All' ?'Try adjusting your filters or search query' :'Create your first trip to start dispatching'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'All' && (
                        <button
                          onClick={() => setCreateOpen(true)}
                          className="inline-flex items-center gap-2 h-8 px-4 bg-primary text-primary-foreground text-xs font-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Icon name="PlusIcon" size={14} />
                          Create First Trip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <TripRow
                    key={trip.id}
                    trip={trip}
                    selected={selectedIds.has(trip.id)}
                    onSelect={() => toggleSelect(trip.id)}
                    onView={() => setDetailTrip(trip)}
                    onDispatch={() => setConfirmAction({ type: 'dispatch', trip })}
                    onComplete={() => setConfirmAction({ type: 'complete', trip })}
                    onCancel={() => setConfirmAction({ type: 'cancel', trip })}
                    onDelete={() => setConfirmAction({ type: 'delete', trip })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Showing {filteredTrips.length} of {trips.length} trips
          </p>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 rounded border border-input flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40" disabled>
              <Icon name="ChevronLeftIcon" size={14} />
            </button>
            <span className="h-7 min-w-[28px] px-2 rounded border border-primary bg-accent text-primary text-xs font-600 flex items-center justify-center">
              1
            </span>
            <button className="h-7 w-7 rounded border border-input flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40" disabled>
              <Icon name="ChevronRightIcon" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 slide-up">
          <div className="bg-foreground text-background rounded-xl shadow-xl px-5 py-3 flex items-center gap-4 text-sm">
            <span className="font-500">{selectedIds.size} trip{selectedIds.size > 1 ? 's' : ''} selected</span>
            <div className="w-px h-4 bg-background/20" />
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-500 transition-colors"
            >
              <Icon name="TrashIcon" size={14} />
              Delete selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1.5 text-background/60 hover:text-background font-500 transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Create Trip Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Trip"
        description="Fill in trip details. All business rules are validated before dispatch."
        size="xl"
      >
        <CreateTripForm
          vehicles={vehicles}
          drivers={drivers}
          onSubmit={handleCreateTrip}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Detail Panel Modal */}
      {detailTrip && (
        <Modal
          open={!!detailTrip}
          onClose={() => setDetailTrip(null)}
          title={`Trip Details — ${detailTrip.id.toUpperCase()}`}
          size="lg"
        >
          <TripDetailPanel trip={detailTrip} />
        </Modal>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          action={confirmAction.type}
          trip={confirmAction.trip}
          onConfirm={() => executeAction(confirmAction.type, confirmAction.trip)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ─── Trip Row ─────────────────────────────────────────────────────────────────
interface TripRowProps {
  trip: Trip;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onDispatch: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function TripRow({ trip, selected, onSelect, onView, onDispatch, onComplete, onCancel, onDelete }: TripRowProps) {
  const cargoPercent = Math.round((trip.cargoWeight / trip.vehicleMaxLoad) * 100);
  const isOverloaded = cargoPercent > 100;
  const isHighLoad = cargoPercent >= 90 && !isOverloaded;

  return (
    <tr
      className={`group transition-colors ${selected ? 'bg-accent/50' : 'hover:bg-muted/40'}`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-input accent-primary cursor-pointer"
          aria-label={`Select trip ${trip.id}`}
        />
      </td>

      {/* Trip ID */}
      <td className="px-4 py-3 w-28">
        <button
          onClick={onView}
          className="text-xs font-600 text-primary hover:underline font-tabular"
        >
          {trip.id.toUpperCase()}
        </button>
      </td>

      {/* Route */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <span className="truncate max-w-[90px]" title={trip.source}>{trip.source}</span>
          <Icon name="ArrowRightIcon" size={10} className="text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[90px]" title={trip.destination}>{trip.destination}</span>
        </div>
      </td>

      {/* Vehicle */}
      <td className="px-4 py-3 w-32">
        <span className="text-xs font-500 text-foreground font-tabular">{trip.vehicleReg}</span>
      </td>

      {/* Driver */}
      <td className="px-4 py-3 min-w-[140px]">
        <span className="text-xs text-foreground">{trip.driverName}</span>
      </td>

      {/* Cargo */}
      <td className="px-4 py-3 w-28 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-xs font-500 font-tabular ${isOverloaded ? 'text-red-600' : isHighLoad ? 'text-amber-600' : 'text-foreground'}`}>
            {trip.cargoWeight.toLocaleString()} kg
          </span>
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' : isHighLoad ? 'bg-amber-400' : 'bg-green-500'}`}
              style={{ width: `${Math.min(cargoPercent, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-tabular">{cargoPercent}% capacity</span>
        </div>
      </td>

      {/* Distance */}
      <td className="px-4 py-3 w-24 text-right">
        <span className="text-xs text-foreground font-tabular">{trip.plannedDistance} km</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 w-28">
        <StatusBadge status={trip.status} />
      </td>

      {/* Created */}
      <td className="px-4 py-3 w-28">
        <span className="text-xs text-muted-foreground font-tabular">{trip.createdAt}</span>
      </td>

      {/* ETA */}
      <td className="px-4 py-3 w-28">
        <span className="text-xs text-muted-foreground font-tabular">{trip.eta}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-32">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton label="View details" onClick={onView} icon="EyeIcon" />
          {trip.status === 'Draft' && (
            <ActionButton label="Dispatch trip" onClick={onDispatch} icon="PaperAirplaneIcon" color="blue" />
          )}
          {trip.status === 'Dispatched' && (
            <ActionButton label="Mark completed" onClick={onComplete} icon="CheckIcon" color="green" />
          )}
          {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
            <ActionButton label="Cancel trip" onClick={onCancel} icon="XMarkIcon" color="amber" />
          )}
          {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
            <ActionButton label="Delete record" onClick={onDelete} icon="TrashIcon" color="red" />
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
  color = 'slate',
}: {
  label: string;
  onClick: () => void;
  icon: string;
  color?: 'slate' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    slate: 'text-muted-foreground hover:text-foreground hover:bg-muted',
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    red: 'text-red-600 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${colorMap[color]}`}
    >
      <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={14} />
    </button>
  );
}