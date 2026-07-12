import type {
  DriverStatus,
  MaintenanceStatus,
  TripStatus,
  UserRole,
  VehicleStatus,
} from "@prisma/client";

export const vehicleStatusLabel: Record<VehicleStatus, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

export const driverStatusLabel: Record<DriverStatus, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
};

export const tripStatusLabel: Record<TripStatus, string> = {
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const maintenanceStatusLabel: Record<MaintenanceStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export function parseVehicleStatus(label: string): VehicleStatus | null {
  const map: Record<string, VehicleStatus> = {
    Available: "AVAILABLE",
    "On Trip": "ON_TRIP",
    "In Shop": "IN_SHOP",
    Retired: "RETIRED",
  };
  return map[label] ?? null;
}

export function parseDriverStatus(label: string): DriverStatus | null {
  const map: Record<string, DriverStatus> = {
    Available: "AVAILABLE",
    "On Trip": "ON_TRIP",
    "Off Duty": "OFF_DUTY",
    Suspended: "SUSPENDED",
  };
  return map[label] ?? null;
}

export function formatDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}
