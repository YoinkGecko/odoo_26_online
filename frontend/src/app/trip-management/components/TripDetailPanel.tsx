import React from 'react';
import { Trip } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/AppIcon';

interface TripDetailPanelProps {
  trip: Trip;
}

export default function TripDetailPanel({ trip }: TripDetailPanelProps) {
  const cargoPercent = Math.round((trip.cargoWeight / trip.vehicleMaxLoad) * 100);
  const isHighLoad = cargoPercent >= 90;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Trip ID', value: <span className="font-600 font-tabular text-primary">{trip.id.toUpperCase()}</span> },
    { label: 'Status', value: <StatusBadge status={trip.status} size="md" /> },
    { label: 'Origin', value: trip.source },
    { label: 'Destination', value: trip.destination },
    { label: 'Vehicle', value: <span className="font-tabular">{trip.vehicleReg}</span> },
    { label: 'Driver', value: trip.driverName },
    {
      label: 'Cargo Weight',
      value: (
        <div className="flex items-center gap-2">
          <span className={`font-tabular font-500 ${isHighLoad ? 'text-amber-600' : ''}`}>
            {trip.cargoWeight.toLocaleString()} kg
          </span>
          <span className="text-xs text-muted-foreground">
            ({cargoPercent}% of {trip.vehicleMaxLoad.toLocaleString()} kg max)
          </span>
          {isHighLoad && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-500">
              <Icon name="ExclamationTriangleIcon" size={12} />
              High load
            </span>
          )}
        </div>
      ),
    },
    { label: 'Planned Distance', value: <span className="font-tabular">{trip.plannedDistance} km</span> },
    { label: 'Created', value: <span className="font-tabular">{trip.createdAt}</span> },
    { label: 'ETA', value: <span className="font-tabular">{trip.eta}</span> },
    ...(trip.dispatchedAt ? [{ label: 'Dispatched', value: <span className="font-tabular">{trip.dispatchedAt}</span> }] : []),
    ...(trip.completedAt ? [{ label: 'Completed', value: <span className="font-tabular">{trip.completedAt}</span> }] : []),
  ];

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={`detail-${row.label}`} className="flex items-start py-2.5 gap-4">
            <dt className="text-sm text-muted-foreground w-36 flex-shrink-0">{row.label}</dt>
            <dd className="text-sm text-foreground flex-1">{row.value}</dd>
          </div>
        ))}
      </dl>

      {/* Lifecycle timeline */}
      <div className="bg-muted/40 rounded-lg p-4">
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Trip Lifecycle</p>
        <div className="flex items-center gap-0">
          {(['Draft', 'Dispatched', 'Completed'] as const).map((stage, i) => {
            const isActive = trip.status === stage;
            const isPast =
              (stage === 'Draft' && ['Dispatched', 'Completed'].includes(trip.status)) ||
              (stage === 'Dispatched' && trip.status === 'Completed');
            const isCancelled = trip.status === 'Cancelled';
            return (
              <React.Fragment key={`stage-${stage}`}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 border-2 ${
                      isCancelled && isActive
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isPast
                        ? 'border-green-400 bg-green-50 text-green-600' :'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {isPast ? <Icon name="CheckIcon" size={12} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-500 ${isActive ? 'text-primary' : isPast ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {stage}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${isPast ? 'bg-green-400' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
          {trip.status === 'Cancelled' && (
            <div className="ml-3 flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 border-2 border-red-400 bg-red-50 text-red-600">
                <Icon name="XMarkIcon" size={12} />
              </div>
              <span className="text-[10px] font-500 text-red-600">Cancelled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}