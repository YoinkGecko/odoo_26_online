import { FuelExpenseRepository, serializeExpense, serializeFuelLog } from "./repository.js";

export class FuelExpenseService {
  constructor(private repo = new FuelExpenseRepository()) {}

  async listFuelLogs() {
    const rows = await this.repo.findFuelLogs();
    return rows.map(serializeFuelLog);
  }

  async listExpenses() {
    const rows = await this.repo.findExpenses();
    return rows.map(serializeExpense);
  }

  async createFuelLog(input: {
    vehicleId: string;
    date: string;
    liters: number;
    cost: number;
    kmCovered: number;
  }) {
    const row = await this.repo.createFuelLog({
      vehicleId: input.vehicleId,
      date: new Date(input.date),
      liters: input.liters,
      cost: input.cost,
      kmCovered: input.kmCovered,
    });
    return serializeFuelLog(row);
  }

  async createExpense(input: {
    vehicleId: string;
    expenseType: string;
    amount: number;
    date: string;
  }) {
    const row = await this.repo.createExpense({
      vehicleId: input.vehicleId,
      expenseType: input.expenseType,
      amount: input.amount,
      date: new Date(input.date),
    });
    return serializeExpense(row);
  }
}
