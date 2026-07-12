import { businessError } from "../../lib/response.js";
import { VehicleRepository, serializeVehicle } from "./repository.js";

export class VehicleService {
  constructor(private repo = new VehicleRepository()) {}

  async list(query: { status?: string; dispatchable?: boolean }) {
    const rows = await this.repo.findAll(query.status, query.dispatchable);
    return rows.map(serializeVehicle);
  }

  async create(input: {
    registrationNumber: string;
    model: string;
    type: string;
    maxLoadKg: number;
    odometerKm: number;
    region: string;
  }) {
    const existing = await this.repo.findByReg(input.registrationNumber);
    if (existing) {
      throw businessError(
        "DUPLICATE_REGISTRATION",
        `Rule: Vehicle registration number must be unique — ${input.registrationNumber} already exists`,
        input.registrationNumber,
      );
    }
    const v = await this.repo.create({
      registrationNumber: input.registrationNumber,
      model: input.model,
      type: input.type,
      maxLoadKg: input.maxLoadKg,
      odometerKm: input.odometerKm,
      region: input.region,
    });
    return serializeVehicle(v);
  }

  async update(id: string, input: Partial<{
    model: string;
    type: string;
    maxLoadKg: number;
    odometerKm: number;
    region: string;
    status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  }>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw businessError("NOT_FOUND", "Vehicle not found");
    const v = await this.repo.update(id, input);
    return serializeVehicle(v);
  }
}
