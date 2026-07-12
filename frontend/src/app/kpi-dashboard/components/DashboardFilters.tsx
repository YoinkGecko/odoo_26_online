'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const VEHICLE_TYPES = ['All Types', 'Van', 'Truck', 'Pickup', 'Flatbed', 'Refrigerated'];
const STATUSES = ['All Statuses', 'Available', 'On Trip', 'In Shop', 'Retired'];
const REGIONS = ['All Regions', 'North', 'South', 'East', 'West'];

export default function DashboardFilters() {
  const [vehicleType, setVehicleType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [region, setRegion] = useState('All Regions');

  const hasActiveFilters =
    vehicleType !== 'All Types' || status !== 'All Statuses' || region !== 'All Regions';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="FunnelIcon" size={14} />
        <span className="font-500">Filter by:</span>
      </div>
      {/* Vehicle Type */}
      <select
        value={vehicleType}
        onChange={(e) => setVehicleType(e?.target?.value)}
        className="h-8 px-3 text-sm border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
        aria-label="Filter by vehicle type"
      >
        {VEHICLE_TYPES?.map((t) => (
          <option key={`vtype-${t}`} value={t}>{t}</option>
        ))}
      </select>
      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e?.target?.value)}
        className="h-8 px-3 text-sm border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
        aria-label="Filter by status"
      >
        {STATUSES?.map((s) => (
          <option key={`vstatus-${s}`} value={s}>{s}</option>
        ))}
      </select>
      {/* Region */}
      <select
        value={region}
        onChange={(e) => setRegion(e?.target?.value)}
        className="h-8 px-3 text-sm border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
        aria-label="Filter by region"
      >
        {REGIONS?.map((r) => (
          <option key={`region-${r}`} value={r}>{r}</option>
        ))}
      </select>
      {hasActiveFilters && (
        <button
          onClick={() => {
            setVehicleType('All Types');
            setStatus('All Statuses');
            setRegion('All Regions');
          }}
          className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground border border-input rounded-md bg-card hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <Icon name="XMarkIcon" size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}