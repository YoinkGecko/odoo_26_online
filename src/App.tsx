import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "landing"
  | "login"
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "trips"
  | "maintenance"
  | "fuel"
  | "reports"
  | "settings";

type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
type MaintenanceStatus = "Open" | "In Progress" | "Closed";
type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const vehicles = [
  { id: 1, reg: "KBX 412G", model: "Isuzu NQR", type: "Truck", maxLoad: "7,500 kg", odometer: "142,380 km", status: "Available" as VehicleStatus, region: "Nairobi" },
  { id: 2, reg: "KDG 881K", model: "Toyota Dyna", type: "Pickup", maxLoad: "2,000 kg", odometer: "89,210 km", status: "On Trip" as VehicleStatus, region: "Mombasa" },
  { id: 3, reg: "KBP 003Z", model: "Mitsubishi Fuso", type: "Heavy Truck", maxLoad: "15,000 kg", odometer: "237,540 km", status: "In Shop" as VehicleStatus, region: "Kisumu" },
  { id: 4, reg: "KCJ 774M", model: "Ford Transit", type: "Van", maxLoad: "1,400 kg", odometer: "61,820 km", status: "Available" as VehicleStatus, region: "Nairobi" },
  { id: 5, reg: "KDD 220F", model: "Tata Prima", type: "Heavy Truck", maxLoad: "25,000 kg", odometer: "301,900 km", status: "Retired" as VehicleStatus, region: "Nakuru" },
  { id: 6, reg: "KBZ 551T", model: "Hino 300", type: "Truck", maxLoad: "5,000 kg", odometer: "178,430 km", status: "On Trip" as VehicleStatus, region: "Mombasa" },
  { id: 7, reg: "KCM 109W", model: "Mercedes Sprinter", type: "Van", maxLoad: "1,500 kg", odometer: "45,600 km", status: "Available" as VehicleStatus, region: "Nairobi" },
  { id: 8, reg: "KBT 667N", model: "MAN TGS", type: "Heavy Truck", maxLoad: "20,000 kg", odometer: "189,770 km", status: "In Shop" as VehicleStatus, region: "Kisumu" },
];

const drivers = [
  { id: 1, name: "James Mwangi", license: "DL-KE-2019-4412", category: "Class G", expiry: "2024-03-15", score: 91, status: "Available" as DriverStatus },
  { id: 2, name: "Faith Achieng", license: "DL-KE-2021-8803", category: "Class CE", expiry: "2026-11-20", score: 87, status: "On Trip" as DriverStatus },
  { id: 3, name: "Patrick Otieno", license: "DL-KE-2018-2291", category: "Class C", expiry: "2024-01-08", score: 64, status: "Suspended" as DriverStatus },
  { id: 4, name: "Grace Wanjiku", license: "DL-KE-2022-5560", category: "Class G", expiry: "2027-06-30", score: 96, status: "Available" as DriverStatus },
  { id: 5, name: "Samuel Kipchoge", license: "DL-KE-2020-7741", category: "Class CE", expiry: "2025-09-14", score: 78, status: "Off Duty" as DriverStatus },
  { id: 6, name: "Diana Mumo", license: "DL-KE-2023-1134", category: "Class B", expiry: "2028-02-28", score: 89, status: "On Trip" as DriverStatus },
  { id: 7, name: "Victor Odhiambo", license: "DL-KE-2019-9920", category: "Class C", expiry: "2024-05-01", score: 72, status: "Off Duty" as DriverStatus },
];

const trips = [
  { id: "TR-1041", source: "Nairobi Depot", dest: "Mombasa Port", vehicle: "KBX 412G", driver: "James Mwangi", cargo: 6200, capacity: 7500, status: "Dispatched" as TripStatus, date: "2026-07-12" },
  { id: "TR-1042", source: "Kisumu Hub", dest: "Nairobi Depot", vehicle: "KDG 881K", driver: "Faith Achieng", cargo: 1800, capacity: 2000, status: "Dispatched" as TripStatus, date: "2026-07-12" },
  { id: "TR-1040", source: "Nakuru Yard", dest: "Kisumu Hub", vehicle: "KBZ 551T", driver: "Diana Mumo", cargo: 4500, capacity: 5000, status: "Dispatched" as TripStatus, date: "2026-07-11" },
  { id: "TR-1038", source: "Nairobi Depot", dest: "Nakuru Yard", vehicle: "KCJ 774M", driver: "Grace Wanjiku", cargo: 1100, capacity: 1400, status: "Completed" as TripStatus, date: "2026-07-10" },
  { id: "TR-1037", source: "Mombasa Port", dest: "Nairobi Depot", vehicle: "KBT 667N", driver: "Samuel Kipchoge", cargo: 18000, capacity: 20000, status: "Completed" as TripStatus, date: "2026-07-09" },
  { id: "TR-1035", source: "Nairobi Depot", dest: "Kisumu Hub", vehicle: "KCM 109W", driver: "James Mwangi", cargo: 900, capacity: 1500, status: "Completed" as TripStatus, date: "2026-07-08" },
  { id: "TR-1033", source: "Mombasa Port", dest: "Nakuru Yard", vehicle: "KDD 220F", driver: "Victor Odhiambo", cargo: 0, capacity: 25000, status: "Cancelled" as TripStatus, date: "2026-07-06" },
  { id: "TR-1043", source: "Nairobi Depot", dest: "Eldoret Yard", vehicle: "", driver: "", cargo: 3200, capacity: 7500, status: "Draft" as TripStatus, date: "2026-07-13" },
];

const maintenance = [
  { id: 1, vehicle: "KBP 003Z", model: "Mitsubishi Fuso", issue: "Transmission fault — gear slipping at 4th", opened: "2026-07-08", status: "In Progress" as MaintenanceStatus, cost: 48000 },
  { id: 2, vehicle: "KBT 667N", model: "MAN TGS", issue: "Brake pad replacement + rotor skim", opened: "2026-07-10", status: "Open" as MaintenanceStatus, cost: 12500 },
  { id: 3, vehicle: "KDG 881K", model: "Toyota Dyna", issue: "Engine oil leak — valve cover gasket", opened: "2026-06-28", status: "Closed" as MaintenanceStatus, cost: 8200 },
  { id: 4, vehicle: "KBX 412G", model: "Isuzu NQR", issue: "AC compressor failure", opened: "2026-06-15", status: "Closed" as MaintenanceStatus, cost: 22000 },
  { id: 5, vehicle: "KCJ 774M", model: "Ford Transit", issue: "Rear suspension bushing worn", opened: "2026-07-11", status: "Open" as MaintenanceStatus, cost: 6800 },
];

const fuelLogs = [
  { id: 1, vehicle: "KBX 412G", date: "2026-07-10", liters: 180, cost: 32400, km: 420 },
  { id: 2, vehicle: "KDG 881K", date: "2026-07-09", liters: 65, cost: 11700, km: 180 },
  { id: 3, vehicle: "KBZ 551T", date: "2026-07-11", liters: 140, cost: 25200, km: 310 },
  { id: 4, vehicle: "KCJ 774M", date: "2026-07-08", liters: 55, cost: 9900, km: 160 },
  { id: 5, vehicle: "KCM 109W", date: "2026-07-07", liters: 48, cost: 8640, km: 140 },
  { id: 6, vehicle: "KBX 412G", date: "2026-07-04", liters: 195, cost: 35100, km: 440 },
  { id: 7, vehicle: "KBZ 551T", date: "2026-07-06", liters: 150, cost: 27000, km: 330 },
];

const expenses = [
  { id: 1, vehicle: "KBX 412G", type: "Maintenance", amount: 22000, date: "2026-06-15" },
  { id: 2, vehicle: "KBP 003Z", type: "Maintenance", amount: 48000, date: "2026-07-08" },
  { id: 3, vehicle: "KBT 667N", type: "Maintenance", amount: 12500, date: "2026-07-10" },
  { id: 4, vehicle: "KDG 881K", type: "Tyres", amount: 38000, date: "2026-06-22" },
  { id: 5, vehicle: "KCJ 774M", type: "Maintenance", amount: 6800, date: "2026-07-11" },
  { id: 6, vehicle: "KBX 412G", type: "Insurance", amount: 95000, date: "2026-07-01" },
  { id: 7, vehicle: "KBZ 551T", type: "Road Tax", amount: 18000, date: "2026-06-30" },
];

const fuelEfficiency = [
  { month: "Jan", efficiency: 2.31 }, { month: "Feb", efficiency: 2.44 },
  { month: "Mar", efficiency: 2.38 }, { month: "Apr", efficiency: 2.52 },
  { month: "May", efficiency: 2.47 }, { month: "Jun", efficiency: 2.61 },
  { month: "Jul", efficiency: 2.58 },
];

const opCostData = [
  { reg: "KBX 412G", fuel: 67500, maintenance: 117000 },
  { reg: "KDG 881K", fuel: 11700, maintenance: 38000 },
  { reg: "KBZ 551T", fuel: 52200, maintenance: 18000 },
  { reg: "KCJ 774M", fuel: 9900, maintenance: 6800 },
  { reg: "KCM 109W", fuel: 8640, maintenance: 0 },
];

const utilizationData = [{ name: "Utilized", value: 71, fill: "#3C3489" }];

const activityFeed = [
  { id: 1, type: "trip", msg: "Trip TR-1042 dispatched — KDG 881K → Nairobi Depot", time: "09:14" },
  { id: 2, type: "maintenance", msg: "Maintenance logged for KBT 667N — brake pad replacement", time: "08:52" },
  { id: 3, type: "driver", msg: "Patrick Otieno's license status flagged — expired 2024-01-08", time: "08:30" },
  { id: 4, type: "trip", msg: "Trip TR-1038 marked Completed — KCJ 774M → Nakuru Yard", time: "Yesterday" },
  { id: 5, type: "fuel", msg: "Fuel log added: KBZ 551T — 140 L / KES 25,200", time: "Yesterday" },
];

// ─── Design System Components ─────────────────────────────────────────────────

const S = {
  statusColor: (s: string) => {
    if (["Available", "Completed"].includes(s)) return { color: "var(--status-green)", background: "var(--status-green-bg)" };
    if (["Pending", "In Shop", "In Progress", "Draft"].includes(s)) return { color: "var(--status-amber)", background: "var(--status-amber-bg)" };
    if (["Suspended", "Overdue", "Cancelled", "Retired"].includes(s)) return { color: "var(--status-red)", background: "var(--status-red-bg)" };
    if (["On Trip", "Dispatched", "Open"].includes(s)) return { color: "var(--status-blue)", background: "var(--status-blue-bg)" };
    return { color: "var(--status-gray)", background: "var(--status-gray-bg)" };
  },
};

function Badge({ label }: { label: string }) {
  const style = S.statusColor(label);
  return (
    <span style={{
      ...style,
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11.5px",
      fontWeight: 500,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Btn({
  children, variant = "primary", onClick, small, icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  small?: boolean;
  icon?: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "none", cursor: "pointer", fontFamily: "inherit",
    fontWeight: 500, borderRadius: "var(--radius)",
    fontSize: small ? 12 : 13,
    padding: small ? "5px 10px" : "8px 14px",
    transition: "background 0.12s, opacity 0.12s",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "#fff" },
    secondary: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--text-secondary)" },
    danger: { background: "#FEE2E2", color: "var(--status-red)" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      ...style,
    }}>{children}</div>
  );
}

function Input({
  placeholder, value, onChange, type = "text", style,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      style={{
        height: 34,
        padding: "0 10px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        fontFamily: "inherit",
        fontSize: 13,
        color: "var(--text)",
        outline: "none",
        width: "100%",
        ...style,
      }}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        height: 34, padding: "0 10px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        fontFamily: "inherit", fontSize: 13, color: "var(--text)",
        outline: "none", cursor: "pointer",
      }}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c} style={{
            padding: "10px 14px", textAlign: "left",
            fontSize: 11.5, fontWeight: 500, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)", background: "#FAFAFA",
            whiteSpace: "nowrap",
          }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td style={{
      padding: "11px 14px",
      fontSize: 13,
      color: muted ? "var(--text-secondary)" : "var(--text)",
      borderBottom: "1px solid var(--border)",
      verticalAlign: "middle",
    }}>{children}</td>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 85 ? "var(--status-green)" : value >= 70 ? "var(--status-amber)" : "var(--status-red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 72, height: 4, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{title}</h2>
      {action}
    </div>
  );
}

function Breadcrumb({ path }: { path: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
      {path.map((p, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <span>/</span>}
          <span style={{ color: i === path.length - 1 ? "var(--text-secondary)" : "var(--text-muted)" }}>{p}</span>
        </span>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        width: 480, maxWidth: "90vw",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Drawer({ title, children, onClose }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.25)",
      display: "flex", justifyContent: "flex-end",
    }} onClick={onClose}>
      <div style={{
        width: 400, height: "100%",
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        overflowY: "auto",
        display: "flex", flexDirection: "column",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "var(--surface)",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 20, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function FieldRow({ label, value, valueStyle }: {
  label: string;
  value: React.ReactNode;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text)", ...valueStyle }}>{value}</span>
    </div>
  );
}

// ─── Icons (inline SVG minimal set) ──────────────────────────────────────────

const Icon = {
  dashboard: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  truck: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 4h9v7H1V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 7h3l2 2v2h-5V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="4" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 7c1.1 0 2 .9 2 2v.5M14 13c0-1.5-.7-2.8-1.7-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  route: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 6v2c0 1.1.9 2 2 2h6c1.1 0 2 .9 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  wrench: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 3.5a3.5 3.5 0 01-4.7 3.3L4.5 11a1.5 1.5 0 002.1 2.1l4.2-4.3c1.1.4 2.4.2 3.3-.7a3.5 3.5 0 000-4.95l-1.5 1.5-1.5-1.5 1.4-1.4-.05-.25z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  fuel: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14V3a1 1 0 011-1h7a1 1 0 011 1v5h1a2 2 0 012 2v1a1 1 0 01-1 1h-1v2H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l3.5-4 3 2.5 3-5.5 2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 015 5v3l1.5 2H2.5L4 10V7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.4"/><path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  chevron: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v7M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Icon2 = {
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.31 2.69 6 6 6s6-2.69 6-6V4L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  globe: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  bell2: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a4.5 4.5 0 014.5 4.5v3l1.5 2H2L3.5 9V6A4.5 4.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4"/></svg>,
};

const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: Icon.dashboard },
  { id: "vehicles", label: "Vehicles", icon: Icon.truck },
  { id: "drivers", label: "Drivers", icon: Icon.users },
  { id: "trips", label: "Trips", icon: Icon.route },
  { id: "maintenance", label: "Maintenance", icon: Icon.wrench },
  { id: "fuel", label: "Fuel & Expenses", icon: Icon.fuel },
  { id: "reports", label: "Reports", icon: Icon.chart },
  { id: "settings", label: "Settings & RBAC", icon: Icon2.settings },
];

function Sidebar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 28, height: 28,
          background: "var(--primary)",
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 10l3-5h6l3 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="4" cy="11.5" r="1.2" fill="white"/>
            <circle cx="10" cy="11.5" r="1.2" fill="white"/>
            <path d="M7 2v3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", letterSpacing: "-0.01em" }}>TransitOps</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 8px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 12px",
              borderRadius: "var(--radius)",
              border: "none", cursor: "pointer",
              background: isActive ? "var(--primary-light)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-secondary)",
              fontFamily: "inherit", fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              marginBottom: 2,
              transition: "background 0.1s, color 0.1s",
              textAlign: "left",
            }}>
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30,
          background: "var(--primary)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 12, fontWeight: 600,
        }}>FM</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>Fleet Manager</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ops@transitops.co</div>
        </div>
      </div>
    </div>
  );
}

function Header({ title }: { title: string; onNav?: (s: Screen) => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <div style={{
      height: 52,
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 24px",
      gap: 16,
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", flex: 1 }}>{title}</span>

      {/* Notification bell */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setNotifOpen(v => !v)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", display: "flex", alignItems: "center",
          padding: 6, borderRadius: 6, position: "relative",
        }}>
          {Icon.bell}
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--status-red)",
          }} />
        </button>
        {notifOpen && (
          <div style={{
            position: "absolute", top: "100%", right: 0,
            width: 300, background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 50,
          }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontWeight: 500, fontSize: 13 }}>Notifications</div>
            {[
              { msg: "License expiry: Patrick Otieno (expired)", type: "red" },
              { msg: "KBP 003Z in maintenance — trip blocked", type: "amber" },
              { msg: "Trip TR-1041 dispatched successfully", type: "green" },
            ].map((n, i) => (
              <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: n.type === "red" ? "var(--status-red)" : n.type === "amber" ? "var(--status-amber)" : "var(--status-green)" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen: Login ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("ops@transitops.co");
  const [password, setPassword] = useState("••••••••••");
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 360 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--primary)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M1 10l3-5h6l3 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4" cy="11.5" r="1.2" fill="white"/>
              <circle cx="10" cy="11.5" r="1.2" fill="white"/>
              <path d="M7 2v3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", letterSpacing: "-0.01em" }}>TransitOps</span>
        </div>

        <Card style={{ padding: 28 }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Sign in</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 22 }}>Fleet Operations Management</p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Email address</label>
            <Input value={email} onChange={setEmail} placeholder="you@company.com" />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Password</label>
            <Input value={password} onChange={setPassword} type="password" />
          </div>

          <button onClick={onLogin} style={{
            width: "100%", height: 38,
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: "var(--radius)",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            cursor: "pointer",
          }}>Continue</button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="#" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>Forgot password?</a>
          </div>
        </Card>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 20 }}>
          © 2026 TransitOps Ltd · Privacy · Terms
        </p>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard ────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: color || "var(--text)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub}</div>}
    </Card>
  );
}

function DashboardScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [regionFilter, setRegionFilter] = useState("All Regions");

  const filtered = activityFeed;

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Dashboard"]} />

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Active Vehicles" value={6} sub="of 8 total" />
        <KpiCard label="Available" value={3} color="var(--status-green)" />
        <KpiCard label="In Maintenance" value={2} color="var(--status-amber)" />
        <KpiCard label="Active Trips" value={3} color="var(--status-blue)" />
        <KpiCard label="Pending Trips" value={1} sub="Draft" />
        <KpiCard label="Drivers On Duty" value={5} sub="of 7 drivers" />
        <KpiCard label="Fleet Utilization" value="71%" color="var(--primary)" />
      </div>

      {/* Filter bar */}
      <Card style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 220 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>{Icon.search}</span>
          <Input placeholder="Search activity..." style={{ paddingLeft: 32 }} />
        </div>
        <Select value={typeFilter} onChange={setTypeFilter} options={["All Types", "Truck", "Van", "Pickup", "Heavy Truck"]} />
        <Select value={statusFilter} onChange={setStatusFilter} options={["All Status", "Available", "On Trip", "In Shop", "Retired"]} />
        <Select value={regionFilter} onChange={setRegionFilter} options={["All Regions", "Nairobi", "Mombasa", "Kisumu", "Nakuru"]} />
        <Btn variant="secondary">Export</Btn>
      </Card>

      {/* Two-column lower */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Recent Activity Table */}
        <Card>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13 }}>Recent Activity</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Event", "Time"]} />
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: a.type === "trip" ? "var(--status-blue)"
                          : a.type === "maintenance" ? "var(--status-amber)"
                          : a.type === "driver" ? "var(--status-red)"
                          : "var(--status-green)",
                      }} />
                      {a.msg}
                    </div>
                  </Td>
                  <Td muted>{a.time}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Fleet Status</div>
            {[
              { label: "Available", count: 3, color: "var(--status-green)" },
              { label: "On Trip", count: 2, color: "var(--status-blue)" },
              { label: "In Shop", count: 2, color: "var(--status-amber)" },
              { label: "Retired", count: 1, color: "var(--status-gray)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{ width: `${(s.count / 8) * 100}%`, height: "100%", background: s.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", width: 16, textAlign: "right" }}>{s.count}</span>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn variant="primary" onClick={() => onNav("trips")} icon={Icon.plus}>New Trip</Btn>
              <Btn variant="secondary" onClick={() => onNav("vehicles")} icon={Icon.truck}>Add Vehicle</Btn>
              <Btn variant="secondary" onClick={() => onNav("maintenance")} icon={Icon.wrench}>Log Maintenance</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Vehicles ─────────────────────────────────────────────────────────

function VehiclesScreen() {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [typeF, setTypeF] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);

  const filtered = vehicles.filter(v =>
    (!search || v.reg.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase())) &&
    (statusF === "All" || v.status === statusF) &&
    (typeF === "All" || v.type === typeF)
  );

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Vehicles"]} />
      <SectionTitle title="Vehicle Registry" action={<Btn variant="primary" icon={Icon.plus}>Add Vehicle</Btn>} />

      <Card style={{ marginBottom: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 240 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>{Icon.search}</span>
          <Input placeholder="Reg No or model…" value={search} onChange={setSearch} style={{ paddingLeft: 32 }} />
        </div>
        <Select value={statusF} onChange={setStatusF} options={["All", "Available", "On Trip", "In Shop", "Retired"]} />
        <Select value={typeF} onChange={setTypeF} options={["All", "Truck", "Van", "Pickup", "Heavy Truck"]} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{filtered.length} vehicles</span>
      </Card>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <TableHeader cols={["Reg No", "Model", "Type", "Max Load", "Odometer", "Region", "Status"]} />
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} onClick={() => setSelectedVehicle(v)} style={{ cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{v.reg}</span></Td>
                <Td>{v.model}</Td>
                <Td muted>{v.type}</Td>
                <Td muted>{v.maxLoad}</Td>
                <Td muted>{v.odometer}</Td>
                <Td muted>{v.region}</Td>
                <Td><Badge label={v.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selectedVehicle && (
        <Drawer title={selectedVehicle.reg} onClose={() => setSelectedVehicle(null)}>
          <div style={{ marginBottom: 16 }}><Badge label={selectedVehicle.status} /></div>
          <FieldRow label="Registration" value={selectedVehicle.reg} />
          <FieldRow label="Model" value={selectedVehicle.model} />
          <FieldRow label="Type" value={selectedVehicle.type} />
          <FieldRow label="Max Load Capacity" value={selectedVehicle.maxLoad} />
          <FieldRow label="Odometer Reading" value={selectedVehicle.odometer} />
          <FieldRow label="Region" value={selectedVehicle.region} />
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" small>Edit Details</Btn>
            <Btn variant="secondary" small>View Trips</Btn>
            <Btn variant="danger" small>Retire</Btn>
          </div>
        </Drawer>
      )}
    </div>
  );
}

// ─── Screen: Drivers ──────────────────────────────────────────────────────────

function isExpiryWarning(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < 90;
}

function DriversScreen() {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");

  const filtered = drivers.filter(d =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license.toLowerCase().includes(search.toLowerCase())) &&
    (statusF === "All" || d.status === statusF)
  );

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Drivers"]} />
      <SectionTitle title="Driver Management" action={<Btn variant="primary" icon={Icon.plus}>Add Driver</Btn>} />

      <Card style={{ marginBottom: 12, padding: "10px 14px", display: "flex", gap: 10 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 240 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>{Icon.search}</span>
          <Input placeholder="Name or license…" value={search} onChange={setSearch} style={{ paddingLeft: 32 }} />
        </div>
        <Select value={statusF} onChange={setStatusF} options={["All", "Available", "On Trip", "Off Duty", "Suspended"]} />
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto", alignSelf: "center" }}>{filtered.length} drivers</span>
      </Card>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <TableHeader cols={["Name", "License No", "Category", "License Expiry", "Safety Score", "Status"]} />
          <tbody>
            {filtered.map(d => {
              const warn = isExpiryWarning(d.expiry);
              const expired = new Date(d.expiry) < new Date();
              return (
                <tr key={d.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <Td><span style={{ fontWeight: 500 }}>{d.name}</span></Td>
                  <Td muted>{d.license}</Td>
                  <Td muted>{d.category}</Td>
                  <Td>
                    <span style={{
                      fontSize: 12,
                      color: expired ? "var(--status-red)" : warn ? "var(--status-amber)" : "var(--text)",
                      fontWeight: (expired || warn) ? 500 : 400,
                    }}>
                      {d.expiry}
                      {expired && " · Expired"}
                      {!expired && warn && " · Expiring soon"}
                    </span>
                  </Td>
                  <Td><ScoreBar value={d.score} /></Td>
                  <Td><Badge label={d.status} /></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Screen: Trips ────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: typeof trips[0] }) {
  const pct = trip.capacity > 0 ? Math.round((trip.cargo / trip.capacity) * 100) : 0;
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{trip.id}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {trip.source} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>→</span> {trip.dest}
          </div>
        </div>
        <Badge label={trip.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Vehicle</div>
          <div style={{ fontSize: 12, color: trip.vehicle ? "var(--text)" : "var(--text-muted)" }}>{trip.vehicle || "Unassigned"}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Driver</div>
          <div style={{ fontSize: 12, color: trip.driver ? "var(--text)" : "var(--text-muted)" }}>{trip.driver || "Unassigned"}</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Cargo load</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text)" }}>
            {trip.cargo.toLocaleString()} / {trip.capacity.toLocaleString()} kg ({pct}%)
          </span>
        </div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? "var(--status-red)" : pct > 70 ? "var(--status-amber)" : "var(--primary)", borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>{trip.date}</div>
    </Card>
  );
}

// Trip lifecycle step definitions
const lifecycleSteps: { status: TripStatus; label: string; desc: string; color: string; bg: string }[] = [
  { status: "Draft",      label: "Draft",      desc: "Trip created, awaiting assignment",  color: "#B45309",      bg: "#FEF3C7" },
  { status: "Dispatched", label: "Dispatched", desc: "Vehicle & driver assigned, en route", color: "var(--primary)", bg: "var(--primary-light)" },
  { status: "Completed",  label: "Completed",  desc: "Trip delivered, record closed",       color: "#16A34A",      bg: "#DCFCE7" },
  { status: "Cancelled",  label: "Cancelled",  desc: "Trip voided before dispatch",         color: "#DC2626",      bg: "#FEE2E2" },
];

function TripLifecycle({ active }: { active: TripStatus }) {
  // Cancelled branches off Dispatched, so we show a linear main flow + a branch
  const mainFlow: TripStatus[] = ["Draft", "Dispatched", "Completed"];
  const activeIdx = mainFlow.indexOf(active);

  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "18px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
        Trip Lifecycle
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative" }}>
        {mainFlow.map((step, i) => {
          const info = lifecycleSteps.find(s => s.status === step)!;
          const isActive = step === active;
          const isPast = activeIdx > i;
          const isConnectorActive = isPast || (i < mainFlow.length - 1 && activeIdx > i);

          return (
            <div key={step} style={{ display: "flex", alignItems: "flex-start", flex: i < mainFlow.length - 1 ? 1 : 0 }}>
              {/* Step node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? info.bg : isPast ? "#DCFCE7" : "var(--bg)",
                  border: `2px solid ${isActive ? info.color : isPast ? "#16A34A" : "var(--border-strong)"}`,
                  flexShrink: 0, zIndex: 1,
                  transition: "all 0.2s",
                }}>
                  {isPast ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: isActive ? info.color : "var(--border-strong)" }} />
                  )}
                </div>
                <div style={{ marginTop: 8, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? info.color : isPast ? "#16A34A" : "var(--text-muted)" }}>{info.label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2, maxWidth: 100 }}>{info.desc}</div>
                </div>
              </div>

              {/* Connector line (not after last) */}
              {i < mainFlow.length - 1 && (
                <div style={{ flex: 1, position: "relative", marginTop: 17 }}>
                  <div style={{
                    height: 2,
                    background: isConnectorActive
                      ? (active === "Cancelled" && i === 1 ? "var(--border)" : "#16A34A")
                      : "var(--border)",
                    transition: "background 0.3s",
                    margin: "0 8px",
                  }} />
                  {/* Arrowhead */}
                  <div style={{
                    position: "absolute", right: 0, top: -4,
                    width: 0, height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: `6px solid ${isConnectorActive && !(active === "Cancelled" && i === 1) ? "#16A34A" : "var(--border)"}`,
                  }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Cancelled branch — shown always, highlights only when active */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 24, marginTop: 0, position: "relative" }}>
          <div style={{ width: 2, height: 20, background: active === "Cancelled" ? "var(--status-red)" : "var(--border)", marginBottom: 0 }} />
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: active === "Cancelled" ? "#FEE2E2" : "var(--bg)",
            border: `2px solid ${active === "Cancelled" ? "var(--status-red)" : "var(--border-strong)"}`,
            flexShrink: 0,
          }}>
            {active === "Cancelled" ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="var(--status-red)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--border-strong)" }} />
            )}
          </div>
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: active === "Cancelled" ? "var(--status-red)" : "var(--text-muted)" }}>Cancelled</div>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2, maxWidth: 90 }}>Trip voided before dispatch</div>
          </div>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", fontSize: 9.5, color: "var(--text-muted)", fontWeight: 500, background: "#fff", padding: "1px 5px", border: "1px solid var(--border)", borderRadius: 3, whiteSpace: "nowrap" }}>
            abort path
          </div>
        </div>
      </div>
    </div>
  );
}

function TripsScreen() {
  const [tab, setTab] = useState<TripStatus>("Dispatched");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ source: "", dest: "", vehicle: "KBX 412G", driver: "James Mwangi", cargo: "" });

  const tabs: TripStatus[] = ["Draft", "Dispatched", "Completed", "Cancelled"];
  const filtered = trips.filter(t => t.status === tab);

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Trips"]} />
      <SectionTitle title="Trip Management" action={<Btn variant="primary" icon={Icon.plus} onClick={() => setShowModal(true)}>New Trip</Btn>} />

      <TripLifecycle active={tab} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 16px",
            border: "none", background: "none",
            borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
            color: tab === t ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "inherit", fontSize: 13,
            fontWeight: tab === t ? 500 : 400,
            cursor: "pointer",
            marginBottom: -1,
          }}>
            {t}
            <span style={{
              marginLeft: 6, padding: "1px 7px",
              background: tab === t ? "var(--primary-light)" : "var(--border)",
              color: tab === t ? "var(--primary)" : "var(--text-muted)",
              borderRadius: 10, fontSize: 11,
            }}>
              {trips.filter(tr => tr.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No {tab} trips</Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map(t => <TripCard key={t.id} trip={t} />)}
        </div>
      )}

      {showModal && (
        <Modal title="New Trip" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Origin</label>
              <Input placeholder="e.g. Nairobi Depot" value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Destination</label>
              <Input placeholder="e.g. Mombasa Port" value={form.dest} onChange={v => setForm(f => ({ ...f, dest: v }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Vehicle</label>
              <Select value={form.vehicle} onChange={v => setForm(f => ({ ...f, vehicle: v }))}
                options={vehicles.filter(v => v.status === "Available").map(v => v.reg)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Driver</label>
              <Select value={form.driver} onChange={v => setForm(f => ({ ...f, driver: v }))}
                options={drivers.filter(d => d.status === "Available").map(d => d.name)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Cargo Weight (kg)</label>
              <Input placeholder="e.g. 4500" value={form.cargo} onChange={v => setForm(f => ({ ...f, cargo: v }))} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setShowModal(false)}>Create Trip</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Screen: Maintenance ──────────────────────────────────────────────────────

function MaintenanceScreen() {
  const [records, setRecords] = useState(maintenance);
  const [toast, setToast] = useState("");
  const [showLog, setShowLog] = useState(false);

  function closeRecord(id: number) {
    setRecords(r => r.map(rec => rec.id === id ? { ...rec, status: "Closed" as MaintenanceStatus } : rec));
    setToast("Record closed — vehicle status reverted to Available");
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Maintenance"]} />
      <SectionTitle title="Maintenance Records" action={<Btn variant="primary" icon={Icon.plus} onClick={() => setShowLog(true)}>Log Maintenance</Btn>} />

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <TableHeader cols={["Vehicle", "Model", "Issue", "Date Opened", "Cost (KES)", "Status", "Actions"]} />
          <tbody>
            {records.map(r => (
              <tr key={r.id}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{r.vehicle}</span></Td>
                <Td muted>{r.model}</Td>
                <Td>{r.issue}</Td>
                <Td muted>{r.opened}</Td>
                <Td muted>{r.cost.toLocaleString()}</Td>
                <Td><Badge label={r.status} /></Td>
                <Td>
                  {r.status !== "Closed" && (
                    <Btn variant="secondary" small onClick={() => closeRecord(r.id)} icon={Icon.check}>Close</Btn>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--text)", color: "#fff",
          padding: "10px 20px", borderRadius: "var(--radius)",
          fontSize: 13, zIndex: 200,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>{toast}</div>
      )}

      {showLog && (
        <Modal title="Log Maintenance" onClose={() => setShowLog(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Vehicle</label>
              <Select value="KBX 412G" onChange={() => {}} options={vehicles.map(v => `${v.reg} — ${v.model}`)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Issue Description</label>
              <textarea style={{
                width: "100%", height: 80, padding: "8px 10px",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                fontFamily: "inherit", fontSize: 13, color: "var(--text)",
                resize: "vertical", outline: "none",
              }} placeholder="Describe the maintenance issue…" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Estimated Cost (KES)</label>
              <Input placeholder="e.g. 15000" />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setShowLog(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setShowLog(false)}>Log Record</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Screen: Fuel & Expenses ──────────────────────────────────────────────────

function fmt(n: number) { return `KES ${n.toLocaleString()}`; }

function FuelScreen() {
  const [tab, setTab] = useState<"fuel" | "expenses">("fuel");

  const vehicleCosts = vehicles.map(v => {
    const fuel = fuelLogs.filter(f => f.vehicle === v.reg).reduce((a, b) => a + b.cost, 0);
    const maint = expenses.filter(e => e.vehicle === v.reg).reduce((a, b) => a + b.amount, 0);
    return { reg: v.reg, model: v.model, fuel, maint, total: fuel + maint };
  }).filter(v => v.total > 0);

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Fuel & Expenses"]} />
      <SectionTitle title="Fuel & Expense Tracking" action={<Btn variant="primary" icon={Icon.plus}>Add Entry</Btn>} />

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total Fuel Cost" value={fmt(fuelLogs.reduce((a, b) => a + b.cost, 0))} sub="July 2026" />
        <KpiCard label="Total Other Expenses" value={fmt(expenses.reduce((a, b) => a + b.amount, 0))} sub="July 2026" />
        <KpiCard label="Total Operational Cost" value={fmt(fuelLogs.reduce((a, b) => a + b.cost, 0) + expenses.reduce((a, b) => a + b.amount, 0))} color="var(--primary)" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
        {(["fuel", "expenses"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 16px", border: "none", background: "none",
            borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
            color: tab === t ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "inherit", fontSize: 13,
            fontWeight: tab === t ? 500 : 400,
            cursor: "pointer", marginBottom: -1, textTransform: "capitalize",
          }}>{t === "fuel" ? "Fuel Logs" : "Other Expenses"}</button>
        ))}
      </div>

      {tab === "fuel" ? (
        <Card style={{ marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Vehicle", "Date", "Liters", "Cost (KES)", "km Covered", "Efficiency (km/L)"]} />
            <tbody>
              {fuelLogs.map(f => (
                <tr key={f.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{f.vehicle}</span></Td>
                  <Td muted>{f.date}</Td>
                  <Td>{f.liters} L</Td>
                  <Td>{f.cost.toLocaleString()}</Td>
                  <Td muted>{f.km} km</Td>
                  <Td><span style={{ fontWeight: 500 }}>{(f.km / f.liters).toFixed(2)}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card style={{ marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHeader cols={["Vehicle", "Expense Type", "Amount (KES)", "Date"]} />
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}
                  onMouseEnter={ev => (ev.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={ev => (ev.currentTarget.style.background = "")}
                >
                  <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{e.vehicle}</span></Td>
                  <Td muted>{e.type}</Td>
                  <Td>{e.amount.toLocaleString()}</Td>
                  <Td muted>{e.date}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Per-vehicle cost summary */}
      <SectionTitle title="Total Operational Cost per Vehicle" />
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <TableHeader cols={["Vehicle", "Model", "Fuel Cost", "Maintenance & Other", "Total Cost"]} />
          <tbody>
            {vehicleCosts.sort((a, b) => b.total - a.total).map(v => (
              <tr key={v.reg}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{v.reg}</span></Td>
                <Td muted>{v.model}</Td>
                <Td>{v.fuel.toLocaleString()}</Td>
                <Td>{v.maint.toLocaleString()}</Td>
                <Td><span style={{ fontWeight: 600, color: "var(--text)" }}>{v.total.toLocaleString()}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Screen: Reports ──────────────────────────────────────────────────────────

function ReportsScreen() {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Reports & Analytics"]} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>Reports & Analytics</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Select value={dateRange} onChange={setDateRange} options={["Last 7 Days", "Last 30 Days", "Last Quarter", "Year to Date"]} />
          <Btn variant="secondary" icon={Icon.download}>Export CSV</Btn>
          <Btn variant="primary" icon={Icon.download}>Export PDF</Btn>
        </div>
      </div>

      {/* Top row: Fuel efficiency + Utilization gauge */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Fuel Efficiency — km/L (Fleet Average)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis domain={[2, 3]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, boxShadow: "none" }}
                formatter={(v) => [`${v} km/L`, "Efficiency"]}
              />
              <Line type="monotone" dataKey="efficiency" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: "var(--primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Fleet Utilization</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>{dateRange}</div>
          <ResponsiveContainer width="100%" height={140}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" data={utilizationData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "var(--border)" }}>
                {utilizationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--primary)", marginTop: -16 }}>71%</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>5 of 7 active vehicles utilized</div>
        </Card>
      </div>

      {/* Operational cost bar chart */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Operational Cost by Vehicle (KES)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={opCostData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="reg" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, boxShadow: "none" }}
              formatter={(v) => [`KES ${Number(v).toLocaleString()}`, ""]}
            />
            <Bar dataKey="fuel" name="Fuel" stackId="a" fill="#3C3489" radius={[0, 0, 0, 0]} />
            <Bar dataKey="maintenance" name="Maintenance & Other" stackId="a" fill="#A5A0D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, background: "#3C3489", borderRadius: 2 }} /> Fuel
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, background: "#A5A0D4", borderRadius: 2 }} /> Maintenance & Other
          </div>
        </div>
      </Card>

      {/* Vehicle ROI Table */}
      <Card>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13 }}>Vehicle ROI Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <TableHeader cols={["Vehicle", "Model", "Total Cost (KES)", "Trips Completed", "Revenue (KES)", "Net ROI"]} />
          <tbody>
            {[
              { reg: "KBX 412G", model: "Isuzu NQR", cost: 184500, trips: 14, revenue: 320000 },
              { reg: "KBZ 551T", model: "Hino 300", cost: 70200, trips: 9, revenue: 185000 },
              { reg: "KDG 881K", model: "Toyota Dyna", cost: 49700, trips: 11, revenue: 120000 },
              { reg: "KBT 667N", model: "MAN TGS", cost: 12500, trips: 6, revenue: 280000 },
              { reg: "KCJ 774M", model: "Ford Transit", cost: 16700, trips: 8, revenue: 95000 },
              { reg: "KCM 109W", model: "Mercedes Sprinter", cost: 8640, trips: 5, revenue: 62000 },
            ].map(r => {
              const roi = r.revenue - r.cost;
              return (
                <tr key={r.reg}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <Td><span style={{ fontWeight: 500, color: "var(--primary)" }}>{r.reg}</span></Td>
                  <Td muted>{r.model}</Td>
                  <Td>{r.cost.toLocaleString()}</Td>
                  <Td muted>{r.trips}</Td>
                  <Td>{r.revenue.toLocaleString()}</Td>
                  <Td>
                    <span style={{ fontWeight: 600, color: roi > 0 ? "var(--status-green)" : "var(--status-red)" }}>
                      {roi > 0 ? "+" : ""}{roi.toLocaleString()}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Screen: Landing ─────────────────────────────────────────────────────────

const features = [
  { icon: Icon.truck, title: "Fleet Registry", desc: "Track every vehicle — odometer, load capacity, status and service history in one place." },
  { icon: Icon.users, title: "Driver Management", desc: "Monitor licenses, safety scores and duty status across your entire driver pool." },
  { icon: Icon.route, title: "Trip Dispatch", desc: "Create, assign and track trips from draft through dispatch to completion." },
  { icon: Icon.wrench, title: "Maintenance Logs", desc: "Log issues, track repair progress and automatically reinstate vehicle availability." },
  { icon: Icon.fuel, title: "Fuel & Expenses", desc: "Reconcile fuel consumption and operational costs per vehicle in real time." },
  { icon: Icon.chart, title: "Analytics & Reports", desc: "Export-ready charts covering efficiency, utilization, costs and ROI by vehicle." },
];

function LandingScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F7", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top nav bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid var(--border)",
        padding: "0 48px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "var(--primary)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <path d="M1 10l3-5h6l3 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4" cy="11.5" r="1.2" fill="white"/>
              <circle cx="10" cy="11.5" r="1.2" fill="white"/>
              <path d="M7 2v3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", letterSpacing: "-0.01em" }}>TransitOps</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", marginRight: 4 }}>Already have an account?</span>
          <button onClick={onEnter} style={{
            padding: "7px 16px", background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500,
            cursor: "pointer",
          }}>Sign In</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: "var(--primary)",
        padding: "80px 48px 72px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.12)", borderRadius: 20,
            padding: "4px 12px", marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Fleet Operations Platform · v2.4</span>
          </div>
          <h1 style={{
            fontSize: 52, fontWeight: 600, color: "#fff",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            marginBottom: 18, maxWidth: 680, margin: "0 auto 18px",
          }}>Operate your fleet with clarity</h1>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.72)",
            maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.6,
          }}>
            TransitOps gives fleet managers, dispatchers, safety officers and analysts one unified platform to run transport operations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={onEnter} style={{
              padding: "12px 28px", background: "#fff", color: "var(--primary)",
              border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600,
              cursor: "pointer", letterSpacing: "-0.01em",
            }}>Open Dashboard →</button>
            <button style={{
              padding: "12px 24px", background: "rgba(255,255,255,0.12)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius)",
              fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>Request a demo</button>
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, maxWidth: 900, margin: "0 auto" }}>
          {[
            { value: "2,400+", label: "Vehicles tracked" },
            { value: "98.4%", label: "Dispatch accuracy" },
            { value: "34%", label: "Cost reduction avg." },
            { value: "12 countries", label: "Active deployments" },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "0 24px",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: "var(--primary)", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{ padding: "60px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>
            Everything your fleet team needs
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto" }}>
            Six integrated modules — built for the people who actually run transport operations.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "20px 22px",
            }}>
              <div style={{
                width: 36, height: 36, background: "var(--primary-light)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary)", marginBottom: 14,
              }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ padding: "0 48px 64px" }}>
        <div style={{
          background: "var(--primary)", borderRadius: 12,
          padding: "36px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Ready to take control of your fleet?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>No setup fees. Works with your existing vehicle data.</div>
          </div>
          <button onClick={onEnter} style={{
            padding: "11px 24px", background: "#fff", color: "var(--primary)",
            border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>Get started free →</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "18px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "var(--primary)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M1 10l3-5h6l3 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4" cy="11.5" r="1.1" fill="white"/>
              <circle cx="10" cy="11.5" r="1.1" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>TransitOps</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2026 TransitOps Ltd. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Settings & RBAC ──────────────────────────────────────────────────

type Permission = "full" | "view" | "none";

const defaultRbac: Record<string, Record<string, Permission>> = {
  "Fleet Manager":    { fleet: "full", drivers: "full", trips: "full",  fuel: "full", analytics: "full"  },
  "Dispatcher":       { fleet: "view", drivers: "none", trips: "full",  fuel: "none", analytics: "none"  },
  "Safety Officer":   { fleet: "none", drivers: "full", trips: "view",  fuel: "none", analytics: "none"  },
  "Financial Analyst":{ fleet: "view", drivers: "none", trips: "none",  fuel: "full", analytics: "full"  },
};

const rbacCols = [
  { key: "fleet",     label: "Fleet" },
  { key: "drivers",   label: "Drivers" },
  { key: "trips",     label: "Trips" },
  { key: "fuel",      label: "Fuel/Exp." },
  { key: "analytics", label: "Analytics" },
];

const permCycle: Permission[] = ["full", "view", "none"];

function PermCell({ value, onChange }: { value: Permission; onChange: (v: Permission) => void }) {
  const next = () => {
    const idx = permCycle.indexOf(value);
    onChange(permCycle[(idx + 1) % permCycle.length]);
  };
  if (value === "full") return (
    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
      <button onClick={next} title="Click to change" style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "var(--primary-light)" }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5l3.5 3.5 6.5-6.5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </td>
  );
  if (value === "view") return (
    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
      <button onClick={next} title="Click to change" style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--status-amber)", background: "var(--status-amber-bg)", padding: "2px 8px", borderRadius: 4 }}>view</span>
      </button>
    </td>
  );
  return (
    <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
      <button onClick={next} title="Click to change" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>—</button>
    </td>
  );
}

function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<"general" | "rbac" | "notifications" | "integrations">("general");
  const [rbac, setRbac] = useState(defaultRbac);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    depotName: "Nairobi Central Depot",
    currency: "KES (Ksh)",
    distanceUnit: "Kilometers",
    timezone: "Africa/Nairobi (UTC+3)",
    defaultRegion: "Nairobi",
    emailAlerts: true,
    smsAlerts: false,
    maintenanceReminders: true,
    licenseExpiryAlerts: true,
    tripUpdates: true,
  });

  function setRbacPerm(role: string, col: string, val: Permission) {
    setRbac(r => ({ ...r, [role]: { ...r[role], [col]: val } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const settingsTabs = [
    { id: "general" as const, label: "General", icon: Icon2.globe },
    { id: "rbac" as const, label: "Roles & Access", icon: Icon2.shield },
    { id: "notifications" as const, label: "Notifications", icon: Icon2.bell2 },
    { id: "integrations" as const, label: "Integrations", icon: Icon2.settings },
  ];

  return (
    <div>
      <Breadcrumb path={["TransitOps", "Settings & RBAC"]} />
      <SectionTitle title="Settings & Access Control" />

      {/* Settings sub-tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {settingsTabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", border: "none", background: "none",
            borderBottom: activeTab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === t.id ? "var(--primary)" : "var(--text-secondary)",
            fontFamily: "inherit", fontSize: 13,
            fontWeight: activeTab === t.id ? 500 : 400,
            cursor: "pointer", marginBottom: -1,
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* General Settings */}
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>General</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Depot Name</label>
                <Input value={settings.depotName} onChange={v => setSettings(s => ({ ...s, depotName: v }))} placeholder="e.g. Nairobi Central Depot" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Currency</label>
                <Select value={settings.currency} onChange={v => setSettings(s => ({ ...s, currency: v }))}
                  options={["KES (Ksh)", "USD ($)", "EUR (€)", "GBP (£)", "INR (₹)", "ZAR (R)"]} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Distance Unit</label>
                <Select value={settings.distanceUnit} onChange={v => setSettings(s => ({ ...s, distanceUnit: v }))}
                  options={["Kilometers", "Miles"]} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Timezone</label>
                <Select value={settings.timezone} onChange={v => setSettings(s => ({ ...s, timezone: v }))}
                  options={["Africa/Nairobi (UTC+3)", "Africa/Lagos (UTC+1)", "Africa/Cairo (UTC+2)", "UTC", "Europe/London (UTC+0)"]} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Default Region</label>
                <Select value={settings.defaultRegion} onChange={v => setSettings(s => ({ ...s, defaultRegion: v }))}
                  options={["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]} />
              </div>
            </div>
          </Card>

          {/* Appearance & Data */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Data & Retention</div>
              {[
                { label: "Trip records retention", value: "24 months" },
                { label: "Fuel log retention", value: "36 months" },
                { label: "Audit log retention", value: "60 months" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r.label}</span>
                  <Select value={r.value} onChange={() => {}} options={["12 months", "24 months", "36 months", "60 months"]} />
                </div>
              ))}
            </Card>

            <Card style={{ padding: 24 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Danger Zone</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>
                These actions are irreversible. Export your data before proceeding.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="danger" small>Export All Data</Btn>
                <Btn variant="danger" small>Reset to Defaults</Btn>
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <Btn variant="primary" onClick={handleSave} icon={saved ? Icon.check : undefined}>
              {saved ? "Saved!" : "Save Changes"}
            </Btn>
          </div>
        </div>
      )}

      {activeTab === "rbac" && (
        <div>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Click any cell to cycle permissions: <strong>Full access</strong> → <strong>View only</strong> → <strong>No access</strong>
            </p>
            <Btn variant="primary" onClick={handleSave} icon={saved ? Icon.check : undefined}>
              {saved ? "Saved!" : "Save Permissions"}
            </Btn>
          </div>

          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "#FAFAFA" }}>
                    Role
                  </th>
                  {rbacCols.map(c => (
                    <th key={c.key} style={{ padding: "10px 16px", textAlign: "center", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "#FAFAFA", whiteSpace: "nowrap" }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(rbac).map(([role, perms]) => (
                  <tr key={role} onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--primary)" }}>{role.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13, color: "var(--text)" }}>{role}</span>
                      </div>
                    </td>
                    {rbacCols.map(c => (
                      <PermCell key={c.key} value={perms[c.key] as Permission} onChange={v => setRbacPerm(role, c.key, v)} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 14, padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, background: "var(--primary-light)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5l3.5 3.5 6.5-6.5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Full access — create, edit, delete</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--status-amber)", background: "var(--status-amber-bg)", padding: "2px 8px", borderRadius: 4 }}>view</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>View only — no edits</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500, width: 24, textAlign: "center" }}>—</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>No access — module hidden</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>Alert Channels</div>
            {[
              { key: "emailAlerts", label: "Email alerts", desc: "Receive alerts at your registered email address" },
              { key: "smsAlerts", label: "SMS alerts", desc: "Receive text messages for critical events" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [item.key]: !(s as any)[item.key] }))} style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: (settings as any)[item.key] ? "var(--primary)" : "var(--border)",
                  position: "relative", flexShrink: 0, transition: "background 0.15s",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: (settings as any)[item.key] ? 21 : 3,
                    transition: "left 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>Alert Types</div>
            {[
              { key: "maintenanceReminders", label: "Maintenance due reminders", desc: "7 days before scheduled service" },
              { key: "licenseExpiryAlerts", label: "License expiry warnings", desc: "90 days before driver license expires" },
              { key: "tripUpdates", label: "Trip status updates", desc: "Dispatched, completed, and cancelled events" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [item.key]: !(s as any)[item.key] }))} style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: (settings as any)[item.key] ? "var(--primary)" : "var(--border)",
                  position: "relative", flexShrink: 0, transition: "background 0.15s",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: (settings as any)[item.key] ? 21 : 3,
                    transition: "left 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            ))}
          </Card>
          <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end" }}>
            <Btn variant="primary" onClick={handleSave}>{saved ? "Saved!" : "Save Preferences"}</Btn>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { name: "REST API", desc: "Access TransitOps data via our REST API. Use API keys for authentication.", status: "Active", key: "sk_live_t8x...4f2a" },
            { name: "Webhook Events", desc: "Receive real-time event payloads when trips, maintenance or fuel logs change.", status: "Inactive", key: null },
            { name: "Google Sheets Export", desc: "Auto-sync trip and expense data to a linked Google Sheet.", status: "Inactive", key: null },
            { name: "WhatsApp Notifications", desc: "Send trip and maintenance alerts to drivers via WhatsApp Business API.", status: "Active", key: "wa_prod_7f...9c3" },
          ].map(int => (
            <Card key={int.name} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{int.name}</span>
                <Badge label={int.status} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>{int.desc}</p>
              {int.key && (
                <div style={{ background: "#F9FAFB", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", marginBottom: 12 }}>
                  {int.key}
                </div>
              )}
              <Btn variant="secondary" small>{int.status === "Active" ? "Manage" : "Configure"}</Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

const screenTitle: Record<Screen, string> = {
  landing: "TransitOps",
  login: "Login",
  dashboard: "Dashboard",
  vehicles: "Vehicle Registry",
  drivers: "Driver Management",
  trips: "Trip Management",
  maintenance: "Maintenance",
  fuel: "Fuel & Expenses",
  reports: "Reports & Analytics",
  settings: "Settings & RBAC",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  if (screen === "landing") {
    return <LandingScreen onEnter={() => setScreen("dashboard")} />;
  }

  if (screen === "login") {
    return <LoginScreen onLogin={() => setScreen("dashboard")} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={screen} onNav={setScreen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header title={screenTitle[screen]} onNav={setScreen} />

        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          {screen === "dashboard" && <DashboardScreen onNav={setScreen} />}
          {screen === "vehicles" && <VehiclesScreen />}
          {screen === "drivers" && <DriversScreen />}
          {screen === "trips" && <TripsScreen />}
          {screen === "maintenance" && <MaintenanceScreen />}
          {screen === "fuel" && <FuelScreen />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "settings" && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}
