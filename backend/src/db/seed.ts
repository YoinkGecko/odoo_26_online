import { prisma } from "../config/db.js";
import { AuthService } from "../modules/auth/service.js";

const DEMO_PASSWORD = "TransitOps2026!";

async function main() {
  console.log("Seeding TransitOps database…");

  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const hash = await AuthService.hashPassword(DEMO_PASSWORD);

  const users = await Promise.all([
    prisma.user.create({ data: { email: "fleet@transitops.co", passwordHash: hash, role: "FLEET_MANAGER" } }),
    prisma.user.create({ data: { email: "dispatcher@transitops.co", passwordHash: hash, role: "DISPATCHER" } }),
    prisma.user.create({ data: { email: "safety@transitops.co", passwordHash: hash, role: "SAFETY_OFFICER" } }),
    prisma.user.create({ data: { email: "finance@transitops.co", passwordHash: hash, role: "FINANCIAL_ANALYST" } }),
  ]);

  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { registrationNumber: "KBX 412G", model: "Isuzu NQR", type: "Truck", maxLoadKg: 7500, odometerKm: 142380, region: "Nairobi", status: "AVAILABLE" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KDG 881K", model: "Toyota Dyna", type: "Pickup", maxLoadKg: 2000, odometerKm: 89210, region: "Mombasa", status: "ON_TRIP" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KBP 003Z", model: "Mitsubishi Fuso", type: "Heavy Truck", maxLoadKg: 15000, odometerKm: 237540, region: "Kisumu", status: "IN_SHOP" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KCJ 774M", model: "Ford Transit", type: "Van", maxLoadKg: 1400, odometerKm: 61820, region: "Nairobi", status: "AVAILABLE" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KDD 220F", model: "Tata Prima", type: "Heavy Truck", maxLoadKg: 25000, odometerKm: 301900, region: "Nakuru", status: "RETIRED" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KBZ 551T", model: "Hino 300", type: "Truck", maxLoadKg: 5000, odometerKm: 178430, region: "Mombasa", status: "ON_TRIP" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KCM 109W", model: "Mercedes Sprinter", type: "Van", maxLoadKg: 1500, odometerKm: 45600, region: "Nairobi", status: "AVAILABLE" } }),
    prisma.vehicle.create({ data: { registrationNumber: "KBT 667N", model: "MAN TGS", type: "Heavy Truck", maxLoadKg: 20000, odometerKm: 189770, region: "Kisumu", status: "IN_SHOP" } }),
  ]);

  const drivers = await Promise.all([
    prisma.driver.create({ data: { name: "James Mwangi", licenseNumber: "DL-KE-2019-4412", licenseCategory: "Class G", licenseExpiry: new Date("2024-03-15"), safetyScore: 91, status: "AVAILABLE" } }),
    prisma.driver.create({ data: { name: "Faith Achieng", licenseNumber: "DL-KE-2021-8803", licenseCategory: "Class CE", licenseExpiry: new Date("2026-11-20"), safetyScore: 87, status: "ON_TRIP" } }),
    prisma.driver.create({ data: { name: "Patrick Otieno", licenseNumber: "DL-KE-2018-2291", licenseCategory: "Class C", licenseExpiry: new Date("2024-01-08"), safetyScore: 64, status: "SUSPENDED" } }),
    prisma.driver.create({ data: { name: "Grace Wanjiku", licenseNumber: "DL-KE-2022-5560", licenseCategory: "Class G", licenseExpiry: new Date("2027-06-30"), safetyScore: 96, status: "AVAILABLE" } }),
    prisma.driver.create({ data: { name: "Samuel Kipchoge", licenseNumber: "DL-KE-2020-7741", licenseCategory: "Class CE", licenseExpiry: new Date("2025-09-14"), safetyScore: 78, status: "OFF_DUTY" } }),
    prisma.driver.create({ data: { name: "Diana Mumo", licenseNumber: "DL-KE-2023-1134", licenseCategory: "Class B", licenseExpiry: new Date("2028-02-28"), safetyScore: 89, status: "ON_TRIP" } }),
    prisma.driver.create({ data: { name: "Victor Odhiambo", licenseNumber: "DL-KE-2019-9920", licenseCategory: "Class C", licenseExpiry: new Date("2024-05-01"), safetyScore: 72, status: "OFF_DUTY" } }),
  ]);

  const [v1, v2, v4, v6, v7] = vehicles;
  const [d1, d2, d4, d6] = drivers;

  await prisma.trip.createMany({
    data: [
      { tripNumber: "TR-1041", source: "Nairobi Depot", destination: "Mombasa Port", cargoWeightKg: 6200, plannedDistanceKm: 480, status: "DISPATCHED", vehicleId: v1.id, driverId: d1.id, scheduledDate: new Date("2026-07-12"), dispatchedAt: new Date() },
      { tripNumber: "TR-1042", source: "Kisumu Hub", destination: "Nairobi Depot", cargoWeightKg: 1800, plannedDistanceKm: 320, status: "DISPATCHED", vehicleId: v2.id, driverId: d2.id, scheduledDate: new Date("2026-07-12"), dispatchedAt: new Date() },
      { tripNumber: "TR-1040", source: "Nakuru Yard", destination: "Kisumu Hub", cargoWeightKg: 4500, plannedDistanceKm: 190, status: "DISPATCHED", vehicleId: v6.id, driverId: d6.id, scheduledDate: new Date("2026-07-11"), dispatchedAt: new Date() },
      { tripNumber: "TR-1038", source: "Nairobi Depot", destination: "Nakuru Yard", cargoWeightKg: 1100, plannedDistanceKm: 160, status: "COMPLETED", vehicleId: v4.id, driverId: d4.id, scheduledDate: new Date("2026-07-10"), completedAt: new Date("2026-07-10") },
      { tripNumber: "TR-1043", source: "Nairobi Depot", destination: "Eldoret Yard", cargoWeightKg: 3200, plannedDistanceKm: 310, status: "DRAFT", scheduledDate: new Date("2026-07-13") },
      { tripNumber: "TR-1033", source: "Mombasa Port", destination: "Nakuru Yard", cargoWeightKg: 0, status: "CANCELLED", scheduledDate: new Date("2026-07-06") },
    ],
  });

  await prisma.maintenanceLog.createMany({
    data: [
      { vehicleId: vehicles[2].id, issue: "Transmission fault — gear slipping at 4th", serviceType: "Transmission", cost: 48000, status: "IN_PROGRESS", openedAt: new Date("2026-07-08") },
      { vehicleId: vehicles[7].id, issue: "Brake pad replacement + rotor skim", serviceType: "Brakes", cost: 12500, status: "OPEN", openedAt: new Date("2026-07-10") },
      { vehicleId: vehicles[1].id, issue: "Engine oil leak — valve cover gasket", serviceType: "Engine", cost: 8200, status: "CLOSED", openedAt: new Date("2026-06-28"), closedAt: new Date("2026-07-01") },
      { vehicleId: vehicles[0].id, issue: "AC compressor failure", serviceType: "HVAC", cost: 22000, status: "CLOSED", openedAt: new Date("2026-06-15"), closedAt: new Date("2026-06-20") },
      { vehicleId: vehicles[3].id, issue: "Rear suspension bushing worn", serviceType: "Suspension", cost: 6800, status: "OPEN", openedAt: new Date("2026-07-11") },
    ],
  });

  await prisma.fuelLog.createMany({
    data: [
      { vehicleId: v1.id, date: new Date("2026-07-10"), liters: 180, cost: 32400, kmCovered: 420 },
      { vehicleId: v2.id, date: new Date("2026-07-09"), liters: 65, cost: 11700, kmCovered: 180 },
      { vehicleId: v6.id, date: new Date("2026-07-11"), liters: 140, cost: 25200, kmCovered: 310 },
      { vehicleId: v4.id, date: new Date("2026-07-08"), liters: 55, cost: 9900, kmCovered: 160 },
      { vehicleId: v7.id, date: new Date("2026-07-07"), liters: 48, cost: 8640, kmCovered: 140 },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { vehicleId: v1.id, expenseType: "Maintenance", amount: 22000, date: new Date("2026-06-15") },
      { vehicleId: vehicles[2].id, expenseType: "Maintenance", amount: 48000, date: new Date("2026-07-08") },
      { vehicleId: vehicles[7].id, expenseType: "Maintenance", amount: 12500, date: new Date("2026-07-10") },
      { vehicleId: v2.id, expenseType: "Tyres", amount: 38000, date: new Date("2026-06-22") },
      { vehicleId: v1.id, expenseType: "Insurance", amount: 95000, date: new Date("2026-07-01") },
    ],
  });

  console.log(`Seeded ${users.length} users (password: ${DEMO_PASSWORD})`);
  console.log(`Seeded ${vehicles.length} vehicles, ${drivers.length} drivers`);
  console.log("Demo logins: fleet@ / dispatcher@ / safety@ / finance@transitops.co");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
