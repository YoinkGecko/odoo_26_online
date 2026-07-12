'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Vehicle, Driver, Trip } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

interface CreateTripFormValues {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
}

interface CreateTripFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onSubmit: (trip: Trip) => void;
  onCancel: () => void;
  existingTripCount: number;
}

export default function CreateTripForm({
  vehicles,
  drivers,
  onSubmit,
  onCancel,
  existingTripCount,
}: CreateTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateTripFormValues>();

  // Eligible vehicles: Available only (not In Shop, On Trip, Retired)
  const eligibleVehicles = vehicles.filter((v) => v.status === 'Available');

  // Eligible drivers: Available only (not On Trip, Suspended, Off Duty with expired license)
  const today = '2026-07-12';
  const eligibleDrivers = drivers.filter(
    (d) =>
      d.status === 'Available' &&
      d.status !== 'Suspended' &&
      d.licenseExpiry >= today
  );

  const selectedVehicleId = watch('vehicleId');
  const selectedDriverId = watch('driverId');
  const cargoWeightValue = watch('cargoWeight');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const cargoPercent = selectedVehicle && cargoWeightValue
    ? Math.round((Number(cargoWeightValue) / selectedVehicle.maxLoadCapacity) * 100)
    : 0;
  const isOverloaded = cargoPercent > 100;
  const isHighLoad = cargoPercent >= 90 && !isOverloaded;

  const handleFormSubmit = async (data: CreateTripFormValues) => {
    // ─── Validation ──────────────────────────────────────────────────────────
    const vehicle = vehicles.find((v) => v.id === data.vehicleId);
    const driver = drivers.find((d) => d.id === data.driverId);

    if (!vehicle) {
      setError('vehicleId', { message: 'Select a valid vehicle' });
      return;
    }
    if (!driver) {
      setError('driverId', { message: 'Select a valid driver' });
      return;
    }

    // Business Rule 2: Vehicle must be Available
    if (vehicle.status !== 'Available') {
      setError('vehicleId', { message: `Vehicle is ${vehicle.status} — only Available vehicles can be dispatched` });
      return;
    }

    // Business Rule 3: Driver must not be suspended or have expired license
    if (driver.status === 'Suspended') {
      setError('driverId', { message: 'Driver is Suspended — cannot be assigned to a trip' });
      return;
    }
    if (driver.licenseExpiry < today) {
      setError('driverId', { message: `Driver license expired on ${driver.licenseExpiry} — renewal required` });
      return;
    }

    // Business Rule 5: Cargo weight must not exceed vehicle max load
    if (Number(data.cargoWeight) > vehicle.maxLoadCapacity) {
      setError('cargoWeight', {
        message: `Cargo weight ${data.cargoWeight} kg exceeds vehicle max load of ${vehicle.maxLoadCapacity.toLocaleString()} kg`,
      });
      return;
    }

    setIsSubmitting(true);

    // TODO: Replace with API call → POST /api/trips
    // const response = await fetch('/api/trips', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // const created = await response.json();

    await new Promise((r) => setTimeout(r, 600));

    const newTrip: Trip = {
      id: `trip-${String(existingTripCount + 1).padStart(3, '0')}`,
      source: data.source,
      destination: data.destination,
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      driverId: driver.id,
      driverName: driver.name,
      cargoWeight: Number(data.cargoWeight),
      vehicleMaxLoad: vehicle.maxLoadCapacity,
      plannedDistance: Number(data.plannedDistance),
      status: 'Draft',
      createdAt: '2026-07-12',
      eta: '2026-07-13',
    };

    setIsSubmitting(false);
    onSubmit(newTrip);
  };

  const inputClass = (hasError: boolean) =>
    `w-full h-9 px-3 rounded-md border text-sm bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${hasError ? 'border-red-400 focus:ring-red-200' : 'border-input'}`;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
      {/* Route section */}
      <div>
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Route</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-500 text-foreground mb-1.5">
              Origin / Source
            </label>
            <input
              id="source"
              type="text"
              placeholder="e.g. Chicago, IL"
              className={inputClass(!!errors.source)}
              {...register('source', { required: 'Origin is required' })}
            />
            {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source.message}</p>}
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-500 text-foreground mb-1.5">
              Destination
            </label>
            <input
              id="destination"
              type="text"
              placeholder="e.g. Detroit, MI"
              className={inputClass(!!errors.destination)}
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="mt-1 text-xs text-red-600">{errors.destination.message}</p>}
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Asset assignment */}
      <div>
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Asset Assignment</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Vehicle */}
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-500 text-foreground mb-1.5">
              Vehicle
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Only Available vehicles are shown
            </p>
            <select
              id="vehicleId"
              className={`${inputClass(!!errors.vehicleId)} cursor-pointer`}
              {...register('vehicleId', { required: 'Select a vehicle' })}
            >
              <option value="">— Select vehicle —</option>
              {eligibleVehicles.map((v) => (
                <option key={`vopt-${v.id}`} value={v.id}>
                  {v.registrationNumber} — {v.name} (max {v.maxLoadCapacity.toLocaleString()} kg)
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-xs text-red-600">{errors.vehicleId.message}</p>}
            {selectedVehicle && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
                <Icon name="TruckIcon" size={12} />
                <span>{selectedVehicle.type} · {selectedVehicle.region} region · {selectedVehicle.odometer.toLocaleString()} km odometer</span>
              </div>
            )}
          </div>

          {/* Driver */}
          <div>
            <label htmlFor="driverId" className="block text-sm font-500 text-foreground mb-1.5">
              Driver
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Suspended/expired drivers are excluded
            </p>
            <select
              id="driverId"
              className={`${inputClass(!!errors.driverId)} cursor-pointer`}
              {...register('driverId', { required: 'Select a driver' })}
            >
              <option value="">— Select driver —</option>
              {eligibleDrivers.map((d) => (
                <option key={`dopt-${d.id}`} value={d.id}>
                  {d.name} — {d.licenseCategory} (score: {d.safetyScore})
                </option>
              ))}
            </select>
            {errors.driverId && <p className="mt-1 text-xs text-red-600">{errors.driverId.message}</p>}
            {selectedDriver && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
                <Icon name="UserIcon" size={12} />
                <span>License {selectedDriver.licenseNumber} · Expires {selectedDriver.licenseExpiry} · Safety score {selectedDriver.safetyScore}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Cargo & distance */}
      <div>
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Cargo & Distance</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cargoWeight" className="block text-sm font-500 text-foreground mb-1.5">
              Cargo Weight (kg)
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              {selectedVehicle
                ? `Max capacity: ${selectedVehicle.maxLoadCapacity.toLocaleString()} kg`
                : 'Select a vehicle to see max capacity'}
            </p>
            <input
              id="cargoWeight"
              type="number"
              min={1}
              placeholder="e.g. 1500"
              className={inputClass(!!errors.cargoWeight)}
              {...register('cargoWeight', {
                required: 'Cargo weight is required',
                min: { value: 1, message: 'Cargo weight must be at least 1 kg' },
                valueAsNumber: true,
              })}
            />
            {errors.cargoWeight && <p className="mt-1 text-xs text-red-600">{errors.cargoWeight.message}</p>}
            {/* Cargo load indicator */}
            {selectedVehicle && cargoWeightValue > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className={`font-500 ${isOverloaded ? 'text-red-600' : isHighLoad ? 'text-amber-600' : 'text-green-700'}`}>
                    {cargoPercent}% of max capacity
                  </span>
                  {isOverloaded && (
                    <span className="text-red-600 font-600 flex items-center gap-1">
                      <Icon name="ExclamationTriangleIcon" size={10} />
                      OVERLOADED
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOverloaded ? 'bg-red-500' : isHighLoad ? 'bg-amber-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(cargoPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="plannedDistance" className="block text-sm font-500 text-foreground mb-1.5">
              Planned Distance (km)
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">
              Estimated route distance for fuel calculations
            </p>
            <input
              id="plannedDistance"
              type="number"
              min={1}
              placeholder="e.g. 280"
              className={inputClass(!!errors.plannedDistance)}
              {...register('plannedDistance', {
                required: 'Planned distance is required',
                min: { value: 1, message: 'Distance must be at least 1 km' },
                valueAsNumber: true,
              })}
            />
            {errors.plannedDistance && <p className="mt-1 text-xs text-red-600">{errors.plannedDistance.message}</p>}
          </div>
        </div>
      </div>

      {/* Business rules notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
        <Icon name="InformationCircleIcon" size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 space-y-0.5">
          <p className="font-600">Dispatch Validation Rules</p>
          <p>Cargo weight must not exceed vehicle max load capacity.</p>
          <p>Only Available vehicles and drivers with valid licenses can be assigned.</p>
          <p>Dispatching will automatically set vehicle and driver status to On Trip.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 text-sm font-500 text-muted-foreground border border-input rounded-md hover:bg-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-5 text-sm font-600 text-primary-foreground bg-primary rounded-md hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px] justify-center"
        >
          {isSubmitting ? (
            <>
              <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Icon name="PlusIcon" size={14} />
              Create Trip (Draft)
            </>
          )}
        </button>
      </div>
    </form>
  );
}