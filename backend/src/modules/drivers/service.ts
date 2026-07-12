import { businessError } from "../../lib/response.js";
import { DriverRepository, serializeDriver } from "./repository.js";

export class DriverService {
  constructor(private repo = new DriverRepository()) {}

  async list(query: { status?: string; dispatchable?: boolean }) {
    const rows = await this.repo.findAll(query.status, query.dispatchable);
    return rows.map(serializeDriver);
  }

  async create(input: {
    name: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiry: string;
    safetyScore: number;
  }) {
    const d = await this.repo.create({
      name: input.name,
      licenseNumber: input.licenseNumber,
      licenseCategory: input.licenseCategory,
      licenseExpiry: new Date(input.licenseExpiry),
      safetyScore: input.safetyScore,
    });
    return serializeDriver(d);
  }

  async update(id: string, input: Partial<{
    name: string;
    licenseCategory: string;
    licenseExpiry: string;
    safetyScore: number;
    status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  }>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw businessError("NOT_FOUND", "Driver not found");
    const data: Record<string, unknown> = { ...input };
    if (input.licenseExpiry) data.licenseExpiry = new Date(input.licenseExpiry);
    const d = await this.repo.update(id, data);
    return serializeDriver(d);
  }
}
