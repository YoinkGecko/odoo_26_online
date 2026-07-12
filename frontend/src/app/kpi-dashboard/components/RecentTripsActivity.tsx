'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Trip } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/AppIcon';

export default function RecentTripsActivity() {
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.trips.list({ limit: '6', sort: 'createdAt:desc' })
      .then(setRecentTrips)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-600 text-foreground">Recent Trips</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest 6 trip records</p>
        </div>
        <Link
          href="/trip-management"
          className="text-xs font-500 text-primary hover:underline flex items-center gap-1"
        >
          View all trips
          <Icon name="ArrowRightIcon" size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Trip ID', 'Route', 'Vehicle', 'Driver', 'Cargo', 'Status', 'Date'].map((h) => (
                <th
                  key={`rth-${h}`}
                  className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading recent trips…
                </td>
              </tr>
            ) : recentTrips.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No trips found.
                </td>
              </tr>
            ) : (
              recentTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 text-xs font-600 text-primary font-tabular whitespace-nowrap">
                    {trip.id.toUpperCase()}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <span className="truncate max-w-[100px]">{trip.source}</span>
                      <Icon name="ArrowRightIcon" size={10} className="text-muted-foreground flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{trip.destination}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-foreground font-tabular whitespace-nowrap">
                    {trip.vehicleReg}
                  </td>
                  <td className="px-5 py-3 text-xs text-foreground whitespace-nowrap">
                    {trip.driverName}
                  </td>
                  <td className="px-5 py-3 text-xs text-foreground font-tabular whitespace-nowrap">
                    {trip.cargoWeight.toLocaleString()} kg
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-tabular whitespace-nowrap">
                    {trip.createdAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
