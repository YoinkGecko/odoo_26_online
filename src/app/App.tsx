import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Truck, Users, Navigation, Wrench, Fuel, BarChart3,
  Settings, LogOut, Bell, Search, ChevronDown, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, XCircle, Plus, Download, Filter, Play,
  Eye, Edit2, Trash2, MoreHorizontal, ArrowRight, Shield, Zap, Globe,
  ChevronRight, X, Package, MapPin, Calendar, Phone, Star, Activity,
  DollarSign, Gauge, RefreshCw, FileText, UploadCloud, Moon, Sun,
  ChevronUp, AlertCircle, Car, UserCheck, Hash, Layers, PieChart,
  BarChart2, LineChart as LineChartIcon, ArrowUpRight, ArrowDownRight,
  Lock, Mail, Menu, CreditCard
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart as RePieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "fleet", label: "Fleet", icon: Truck },
  { id: "drivers", label: "Drivers", icon: Users },
  { id: "trips", label: "Trips", icon: Navigation },
  { id: "maintenance", label: "Maintenance", icon: Wrench, badge: 3 },
  { id: "fuel", label: "Fuel & Expenses", icon: Fuel },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  Available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "On Trip": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "In Shop": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Retired: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  "Off Duty": "text-gray-400 bg-gray-400/10 border-gray-400/20",
  Suspended: "text-red-400 bg-red-400/10 border-red-400/20",
  Scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "In Progress": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Overdue: "text-red-400 bg-red-400/10 border-red-400/20",
  Cancelled: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  Pending: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const VEHICLES = [
  { id: "V-001", name: "Mercedes Actros 2545", type: "Heavy Truck", reg: "KCA 441Z", model: "Actros 2545", maxLoad: 25000, currentLoad: 18500, odometer: 142350, cost: 4200000, purchaseDate: "2021-03-15", insurance: "2025-03-14", status: "On Trip", fuel: "Diesel" },
  { id: "V-002", name: "Isuzu FVR 134", type: "Medium Truck", reg: "KCB 112A", model: "FVR 134", maxLoad: 8000, currentLoad: 0, odometer: 87420, cost: 1850000, purchaseDate: "2022-07-20", insurance: "2025-07-19", status: "Available", fuel: "Diesel" },
  { id: "V-003", name: "Toyota Hilux GD6", type: "Pickup", reg: "KCC 778B", model: "Hilux GD6", maxLoad: 1000, currentLoad: 0, odometer: 34200, cost: 380000, purchaseDate: "2023-01-10", insurance: "2025-06-30", status: "In Shop", fuel: "Diesel" },
  { id: "V-004", name: "UD Trucks Quon", type: "Heavy Truck", reg: "KCD 234C", model: "Quon GW26", maxLoad: 30000, currentLoad: 27000, odometer: 289100, cost: 5100000, purchaseDate: "2019-11-05", insurance: "2024-11-04", status: "On Trip", fuel: "Diesel" },
  { id: "V-005", name: "Hino 700 Series", type: "Heavy Truck", reg: "KCE 567D", model: "700 FY", maxLoad: 22000, currentLoad: 0, odometer: 198750, cost: 3750000, purchaseDate: "2020-06-22", insurance: "2025-06-21", status: "Available", fuel: "Diesel" },
  { id: "V-006", name: "Ford Transit Van", type: "Van", reg: "KCF 890E", model: "Transit Custom", maxLoad: 1400, currentLoad: 0, odometer: 56300, cost: 280000, purchaseDate: "2022-09-18", insurance: "2025-09-17", status: "Available", fuel: "Petrol" },
  { id: "V-007", name: "Scania R450", type: "Heavy Truck", reg: "KCG 123F", model: "R450 LA", maxLoad: 28000, currentLoad: 0, odometer: 412000, cost: 6200000, purchaseDate: "2018-04-12", insurance: "2024-04-11", status: "Retired", fuel: "Diesel" },
];

const DRIVERS = [
  { id: "D-001", name: "James Mwangi", license: "DL-2019-00123", category: "Class GV", expiry: "2026-04-15", safety: 94, vehicle: "KCA 441Z", status: "On Trip", experience: "7 yrs", phone: "+254 712 345678", trips: 847, incidents: 1, rating: 4.8, avatar: "JM" },
  { id: "D-002", name: "Sarah Ochieng", license: "DL-2021-00456", category: "Class C", expiry: "2025-08-22", safety: 88, vehicle: "—", status: "Available", experience: "4 yrs", phone: "+254 723 456789", trips: 412, incidents: 0, rating: 4.9, avatar: "SO" },
  { id: "D-003", name: "Peter Kamau", license: "DL-2018-00789", category: "Class GV", expiry: "2024-12-01", safety: 71, vehicle: "KCD 234C", status: "On Trip", experience: "9 yrs", phone: "+254 734 567890", trips: 1203, incidents: 4, rating: 4.5, avatar: "PK" },
  { id: "D-004", name: "Grace Wanjiku", license: "DL-2022-00321", category: "Class B", expiry: "2025-11-30", safety: 97, vehicle: "—", status: "Off Duty", experience: "2 yrs", phone: "+254 745 678901", trips: 156, incidents: 0, rating: 5.0, avatar: "GW" },
  { id: "D-005", name: "David Otieno", license: "DL-2020-00654", category: "Class C", expiry: "2024-06-15", safety: 62, vehicle: "—", status: "Suspended", experience: "5 yrs", phone: "+254 756 789012", trips: 634, incidents: 7, rating: 3.9, avatar: "DO" },
  { id: "D-006", name: "Mary Njeri", license: "DL-2021-00987", category: "Class B", expiry: "2026-02-28", safety: 91, vehicle: "KCE 567D", status: "Available", experience: "3 yrs", phone: "+254 767 890123", trips: 289, incidents: 0, rating: 4.7, avatar: "MN" },
];

const TRIPS = [
  { id: "TR-8821", vehicle: "KCA 441Z", driver: "James Mwangi", origin: "Nairobi CBD", destination: "Mombasa Port", status: "In Progress", eta: "18:30", distance: "480 km", cargo: "Electronics", weight: 18500, priority: "High" },
  { id: "TR-8820", vehicle: "KCD 234C", driver: "Peter Kamau", origin: "Eldoret ICD", destination: "Nairobi Westlands", status: "In Progress", eta: "16:45", distance: "310 km", cargo: "Agricultural Produce", weight: 27000, priority: "Normal" },
  { id: "TR-8819", vehicle: "KCB 112A", driver: "Sarah Ochieng", origin: "Nairobi CBD", destination: "Kisumu City", status: "Completed", eta: "—", distance: "340 km", cargo: "FMCG Goods", weight: 6200, priority: "Normal" },
  { id: "TR-8818", vehicle: "KCF 890E", driver: "Mary Njeri", origin: "Karen Estate", destination: "Wilson Airport", status: "Completed", eta: "—", distance: "12 km", cargo: "Documents", weight: 45, priority: "Urgent" },
  { id: "TR-8817", vehicle: "KCE 567D", driver: "Grace Wanjiku", origin: "Athi River EPZ", destination: "Thika Town", status: "Cancelled", eta: "—", distance: "52 km", cargo: "Industrial Parts", weight: 14000, priority: "Normal" },
  { id: "TR-8816", vehicle: "KCB 112A", driver: "Sarah Ochieng", origin: "Nairobi CBD", destination: "Nakuru City", status: "Scheduled", eta: "Tomorrow 08:00", distance: "156 km", cargo: "Consumer Goods", weight: 5800, priority: "Normal" },
];

const MAINTENANCE = [
  { id: "MNT-441", vehicle: "KCC 778B — Toyota Hilux", type: "Engine Overhaul", category: "Mechanical", priority: "High", cost: 85000, technician: "Alex Mutua", date: "2025-01-12", status: "In Progress", notes: "Cylinder head gasket replacement" },
  { id: "MNT-440", vehicle: "KCA 441Z — Mercedes Actros", type: "Tyre Replacement", category: "Tyres", priority: "Normal", cost: 42000, technician: "Ben Kipchoge", date: "2025-01-18", status: "Scheduled", notes: "All 6 rear tyres due for replacement" },
  { id: "MNT-439", vehicle: "KCD 234C — UD Trucks Quon", type: "Brake Service", category: "Brakes", priority: "High", cost: 28500, technician: "Alex Mutua", date: "2025-01-08", status: "Completed", notes: "Front and rear brake pad replacement" },
  { id: "MNT-438", vehicle: "KCG 123F — Scania R450", type: "Annual Inspection", category: "Inspection", priority: "Normal", cost: 15000, technician: "Chris Ouma", date: "2024-12-20", status: "Overdue", notes: "Vehicle due for government inspection" },
  { id: "MNT-437", vehicle: "KCE 567D — Hino 700", type: "Oil Change", category: "Servicing", priority: "Low", cost: 8500, technician: "Ben Kipchoge", date: "2025-01-25", status: "Scheduled", notes: "10,000 km interval service" },
];

const FUEL_LOGS = [
  { id: "FL-991", vehicle: "KCA 441Z", driver: "James Mwangi", liters: 180, cost: 31500, date: "2025-01-13", odometer: 142100, station: "Total Energies Mombasa Rd", efficiency: "2.8 km/L" },
  { id: "FL-990", vehicle: "KCD 234C", driver: "Peter Kamau", liters: 220, cost: 38500, date: "2025-01-12", odometer: 288800, station: "Shell Uhuru Highway", efficiency: "2.3 km/L" },
  { id: "FL-989", vehicle: "KCB 112A", driver: "Sarah Ochieng", liters: 95, cost: 16625, date: "2025-01-12", odometer: 87220, station: "Kenol Westlands", efficiency: "3.6 km/L" },
  { id: "FL-988", vehicle: "KCE 567D", driver: "Mary Njeri", liters: 160, cost: 28000, date: "2025-01-11", odometer: 198520, station: "Rubis Thika Rd", efficiency: "2.6 km/L" },
  { id: "FL-987", vehicle: "KCF 890E", driver: "Grace Wanjiku", liters: 45, cost: 7875, date: "2025-01-11", odometer: 56180, station: "Total Langata Rd", efficiency: "6.8 km/L" },
];

const EXPENSES = [
  { id: "EX-551", vehicle: "KCC 778B", type: "Maintenance", amount: 85000, receipt: "RCP-3421", status: "Approved", date: "2025-01-12", description: "Engine overhaul" },
  { id: "EX-550", vehicle: "KCA 441Z", type: "Fuel", amount: 31500, receipt: "RCP-3420", status: "Approved", date: "2025-01-13", description: "Diesel refuel Mombasa" },
  { id: "EX-549", vehicle: "KCD 234C", type: "Toll", amount: 4200, receipt: "RCP-3419", status: "Approved", date: "2025-01-12", description: "Nairobi Expressway toll" },
  { id: "EX-548", vehicle: "KCB 112A", type: "Insurance", amount: 124000, receipt: "RCP-3418", status: "Pending", date: "2025-01-10", description: "Annual renewal" },
  { id: "EX-547", vehicle: "KCA 441Z", type: "Repair", amount: 18500, receipt: "RCP-3417", status: "Pending", date: "2025-01-09", description: "Air suspension repair" },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────

const utilizationData = [
  { month: "Aug", utilization: 72 }, { month: "Sep", utilization: 78 },
  { month: "Oct", utilization: 81 }, { month: "Nov", utilization: 74 },
  { month: "Dec", utilization: 68 }, { month: "Jan", utilization: 83 },
];

const tripTrendData = [
  { week: "W48", completed: 42, cancelled: 3 }, { week: "W49", completed: 38, cancelled: 5 },
  { week: "W50", completed: 51, cancelled: 2 }, { week: "W51", completed: 47, cancelled: 4 },
  { week: "W52", completed: 44, cancelled: 6 }, { week: "W1", completed: 56, cancelled: 2 },
];

const monthlyExpenseData = [
  { month: "Aug", fuel: 280000, maintenance: 120000, other: 45000 },
  { month: "Sep", fuel: 310000, maintenance: 85000, other: 62000 },
  { month: "Oct", fuel: 295000, maintenance: 210000, other: 38000 },
  { month: "Nov", fuel: 320000, maintenance: 95000, other: 71000 },
  { month: "Dec", fuel: 275000, maintenance: 145000, other: 55000 },
  { month: "Jan", fuel: 340000, maintenance: 185000, other: 48000 },
];

const expensePieData = [
  { name: "Fuel", value: 340000, color: "#F59E0B" },
  { name: "Maintenance", value: 185000, color: "#3B82F6" },
  { name: "Insurance", value: 124000, color: "#8B5CF6" },
  { name: "Tolls", value: 18200, color: "#22C55E" },
  { name: "Repairs", value: 42000, color: "#EF4444" },
];

const fuelConsumptionData = [
  { month: "Aug", liters: 3200 }, { month: "Sep", liters: 3580 },
  { month: "Oct", liters: 3410 }, { month: "Nov", liters: 3720 },
  { month: "Dec", liters: 3180 }, { month: "Jan", liters: 3890 },
];

const driverPerformanceData = [
  { name: "J. Mwangi", score: 94, trips: 847 },
  { name: "S. Ochieng", score: 88, trips: 412 },
  { name: "G. Wanjiku", score: 97, trips: 156 },
  { name: "M. Njeri", score: 91, trips: 289 },
  { name: "P. Kamau", score: 71, trips: 1203 },
];

// ─── Shared UI Components ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
      {status}
    </span>
  );
}

function KpiCard({ label, value, sub, icon: Icon, trend, trendUp, accent = false }: {
  label: string; value: string; sub: string; icon: React.ElementType; trend?: string; trendUp?: boolean; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 transition-all hover:border-amber-500/30 ${accent ? "bg-amber-500/10 border-amber-500/30" : "bg-[#1D2128] border-[#2B313B]"}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${accent ? "bg-amber-500/20" : "bg-[#2B313B]"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-amber-400" : "text-gray-400"}`} />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-semibold ${accent ? "text-amber-400" : "text-white"}`}>{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", onClick, className = "" }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; onClick?: () => void; className?: string;
}) {
  const base = "inline-flex items-center gap-2 rounded-lg font-medium transition-all cursor-pointer border";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-400 text-black border-amber-500",
    secondary: "bg-[#2B313B] hover:bg-[#353d49] text-white border-[#2B313B]",
    ghost: "bg-transparent hover:bg-[#2B313B] text-gray-400 hover:text-white border-transparent",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function SearchBar({ placeholder = "Search…", className = "", value, onChange }: { placeholder?: string; className?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-9 pr-4 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
      />
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1D2128] border border-[#2B313B] rounded-xl p-5 ${className}`}>
      <div className="text-sm font-semibold text-white mb-4">{title}</div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#1D2128",
  border: "1px solid #2B313B",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#fff",
};

// ─── Screens ──────────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [role, setRole] = useState("Fleet Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@transitops.co.ke");

  const roles = [
    { id: "Fleet Manager", desc: "Full access to all modules", perms: ["Vehicles", "Drivers", "Trips", "Maintenance", "Reports", "Settings"] },
    { id: "Dispatcher", desc: "Trip planning and driver assignment", perms: ["Trips", "Drivers", "Fleet View"] },
    { id: "Safety Officer", desc: "Compliance and incident management", perms: ["Drivers", "Maintenance", "Reports"] },
    { id: "Financial Analyst", desc: "Expense tracking and analytics", perms: ["Fuel & Expenses", "Reports", "Analytics"] },
  ];

  const selectedRole = roles.find(r => r.id === role) || roles[0];

  return (
    <div className="min-h-screen bg-[#0F1115] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#171A1F] border-r border-[#2B313B] p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TransitOps</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Transport<br />Operations Platform
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Enterprise-grade fleet management. Real-time visibility across your entire transport network.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: Activity, label: "Real-time Fleet Tracking", sub: "Live vehicle locations and status" },
              { icon: Shield, label: "RBAC Security Model", sub: "Role-based permissions for every user" },
              { icon: BarChart3, label: "Executive Analytics", sub: "Cost, utilization and ROI reports" },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-4 p-4 bg-[#1D2128] border border-[#2B313B] rounded-xl">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 text-xs text-gray-600">
          {["Encrypted Login", "RBAC Enabled", "Audit Logging"].map(item => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white">TransitOps</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8">Enterprise transport operations dashboard</p>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Sign in as</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${role === r.id ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-[#2B313B] bg-[#1D2128] text-gray-400 hover:border-gray-500"}`}
                >
                  <div className="text-xs font-semibold">{r.id}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions preview */}
          <div className="mb-6 p-3 bg-[#1D2128] border border-[#2B313B] rounded-lg">
            <div className="text-xs text-gray-500 mb-2">Access permissions for <span className="text-amber-400">{selectedRole.id}</span></div>
            <div className="flex flex-wrap gap-1.5">
              {selectedRole.perms.map(p => (
                <span key={p} className="text-xs px-2 py-0.5 bg-[#2B313B] text-gray-300 rounded-md">{p}</span>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  defaultValue="••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 transition-colors"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amber-500 w-3.5 h-3.5" />
                <span className="text-xs text-gray-400">Remember me</span>
              </label>
              <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Forgot password?</button>
            </div>

            <button
              onClick={onLogin}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex gap-4 text-xs text-gray-600 justify-center">
            <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> 256-bit TLS</div>
            <div className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-emerald-500" /> RBAC Enabled</div>
            <div className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-emerald-500" /> Audit Logs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/dashboard");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const kpis = [
    { label: "Active Vehicles", value: stats ? stats.activeVehicles.count.toString() : "4", sub: stats ? `of ${stats.activeVehicles.total} total` : "of 7 total", icon: Truck, trend: "+1 this week", trendUp: true },
    { label: "Available Vehicles", value: stats ? stats.availableVehicles.toString() : "3", sub: "ready for dispatch", icon: CheckCircle, trend: "same as yesterday", trendUp: true },
    { label: "In Maintenance", value: stats ? stats.maintenanceCount.toString() : "1", sub: "vehicles in shop", icon: Wrench, trend: "-1 resolved this week", trendUp: true },
    { label: "Active Trips", value: stats ? stats.trips.toString() : "2", sub: "in transit now", icon: Navigation, trend: "+2 from this morning", trendUp: true, accent: true },
    { label: "Drivers On Duty", value: stats ? stats.drivers.active.toString() : "4", sub: stats ? `of ${stats.drivers.total} registered` : "of 6 registered", icon: Users, trend: "2 off duty", trendUp: false },
    { label: "Fleet Utilization", value: stats ? stats.fleetUtilization : "83%", sub: "highest this month", icon: Gauge, trend: "+5% vs last month", trendUp: true },
    { label: "Pending Trips", value: "1", sub: "scheduled tomorrow", icon: Clock, trend: "1 pending approval", trendUp: false },
    { label: "Op. Cost Today", value: "KES 73K", sub: "fuel + maintenance", icon: DollarSign, trend: "+12% vs avg", trendUp: false },
  ];

  const alerts = [
    { type: "danger", icon: AlertTriangle, msg: "DL-2020-00654 (David Otieno) — license expired June 2024" },
    { type: "warning", icon: Clock, msg: "KCC 778B — Toyota Hilux overdue maintenance check-in" },
    { type: "warning", icon: AlertCircle, msg: "Annual inspection overdue on KCG 123F — Scania R450" },
    { type: "info", icon: DollarSign, msg: "Operational cost 12% above monthly average target" },
  ];

  const fleetStatusCounts = [
    { label: "Available", count: stats ? stats.availableVehicles : 3, total: stats ? stats.activeVehicles.total : 7, color: "bg-emerald-400" },
    { label: "On Trip", count: stats ? stats.activeVehicles.count : 2, total: stats ? stats.activeVehicles.total : 7, color: "bg-blue-400" },
    { label: "In Shop", count: stats ? stats.maintenanceCount : 1, total: stats ? stats.activeVehicles.total : 7, color: "bg-amber-400" },
    { label: "Retired", count: 1, total: stats ? stats.activeVehicles.total : 7, color: "bg-gray-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {["All Vehicles", "All Regions", "All Statuses", "Last 30 Days"].map(f => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors">
            {f} <ChevronDown className="w-3 h-3" />
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Fleet Utilization %" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={utilizationData}>
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="utilization" stroke="#F59E0B" strokeWidth={2} fill="url(#utilGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Status">
          <div className="space-y-3 mt-2">
            {fleetStatusCounts.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{s.label}</span>
                  <span className="text-white font-medium">{s.count}</span>
                </div>
                <div className="h-1.5 bg-[#2B313B] rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#2B313B] rounded-lg">
            <div className="text-xs text-gray-400">Total Fleet</div>
            <div className="text-xl font-bold text-white">{stats ? stats.activeVehicles.total : 7} <span className="text-sm font-normal text-gray-500">vehicles</span></div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Trip Completion Trend" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tripTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="week" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="completed" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Completed" />
              <Bar dataKey="cancelled" fill="#EF4444" radius={[3, 3, 0, 0]} name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alerts Panel */}
        <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-4">Active Alerts</div>
          <div className="space-y-2.5">
            {alerts.map((a, i) => (
              <div key={i} className={`flex gap-2.5 p-2.5 rounded-lg text-xs ${a.type === "danger" ? "bg-red-500/10 border border-red-500/20" : a.type === "warning" ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                <a.icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.type === "danger" ? "text-red-400" : a.type === "warning" ? "text-amber-400" : "text-blue-400"}`} />
                <span className={`${a.type === "danger" ? "text-red-300" : a.type === "warning" ? "text-amber-300" : "text-blue-300"} leading-relaxed`}>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B313B]">
          <div className="text-sm font-semibold text-white">Recent Trips</div>
          <Btn variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" />View All</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B313B]">
                {["Trip ID", "Vehicle", "Driver", "Route", "Status", "ETA", "Distance"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313B]">
              {(stats ? stats.recentTrips : TRIPS.slice(0, 5)).map((t: any) => (
                <tr key={t.id} className="hover:bg-[#2B313B]/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-amber-400">{t.id}</td>
                  <td className="px-5 py-3 text-white font-medium">{t.vehicle}</td>
                  <td className="px-5 py-3 text-gray-300">{t.driver}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.origin} → {t.destination}</td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3 text-gray-300 font-mono text-xs">{t.eta}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VehicleRegistry() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [regNumber, setRegNumber] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("Heavy Truck");
  const [fuelType, setFuelType] = useState("Diesel");
  const [status, setStatus] = useState("Available");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchVehicles = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        type: typeFilter,
        status: statusFilter,
        fuelType: fuelFilter,
      });
      const res = await fetch(`http://localhost:5000/api/v1/vehicles?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data);
        setTotalVehicles(json.pagination.total);
        setTotalPages(json.pagination.totalPages);

        // Update the global VEHICLES array in-place so other components stay synchronized
        VEHICLES.length = 0;
        VEHICLES.push(...json.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          reg: v.regNumber,
          model: v.model,
          maxLoad: v.maxCapacity,
          odometer: v.odometer,
          cost: Number(v.acquisitionCost),
          purchaseDate: v.purchaseDate ? new Date(v.purchaseDate).toISOString().split('T')[0] : "",
          insurance: v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString().split('T')[0] : "",
          status: v.status,
          fuel: v.fuelType
        })));
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, search, typeFilter, statusFilter, fuelFilter]);

  const resetForm = () => {
    setEditingId(null);
    setRegNumber("");
    setName("");
    setModel("");
    setType("Heavy Truck");
    setFuelType("Diesel");
    setStatus("Available");
    setMaxCapacity("");
    setOdometer("");
    setAcquisitionCost("");
    setPurchaseDate("");
    setInsuranceExpiry("");
    setErrorMsg("");
  };

  const handleEditClick = (v: any) => {
    setEditingId(v.id);
    setRegNumber(v.regNumber);
    setName(v.name);
    setModel(v.model);
    setType(v.type);
    setFuelType(v.fuelType);
    setStatus(v.status);
    setMaxCapacity(v.maxCapacity.toString());
    setOdometer(v.odometer.toString());
    setAcquisitionCost(Number(v.acquisitionCost).toString());
    setPurchaseDate(v.purchaseDate ? new Date(v.purchaseDate).toISOString().split('T')[0] : "");
    setInsuranceExpiry(v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString().split('T')[0] : "");
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/vehicles/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchVehicles();
        setSelected(prev => prev.filter(s => s !== id));
      } else {
        alert(json.error?.message || "Failed to delete vehicle");
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${selected.length} selected vehicles?`)) return;
    try {
      await Promise.all(
        selected.map(id =>
          fetch(`http://localhost:5000/api/v1/vehicles/${id}`, {
            method: "DELETE",
          })
        )
      );
      setSelected([]);
      fetchVehicles();
    } catch (err) {
      console.error("Error in bulk delete:", err);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      regNumber,
      name,
      model,
      type,
      fuelType,
      status,
      maxCapacity: Number(maxCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      purchaseDate,
      insuranceExpiry,
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:5000/api/v1/vehicles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:5000/api/v1/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to save vehicle");
        return;
      }

      setShowDrawer(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setErrorMsg("Network error occurred.");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Vehicle Registry"
        subtitle={`${totalVehicles} vehicles registered`}
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm"><Download className="w-3.5 h-3.5" />Export CSV</Btn>
            <Btn size="sm" onClick={() => { resetForm(); setShowDrawer(true); }}><Plus className="w-3.5 h-3.5" />Add Vehicle</Btn>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar
          placeholder="Search by reg, name, or type…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />

        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="Heavy Truck">Heavy Truck</option>
          <option value="Medium Truck">Medium Truck</option>
          <option value="Pickup">Pickup</option>
          <option value="Van">Van</option>
          <option value="Bus">Bus</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>

        <select
          value={fuelFilter}
          onChange={e => { setFuelFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors focus:outline-none"
        >
          <option value="">All Fuel Types</option>
          <option value="Diesel">Diesel</option>
          <option value="Petrol">Petrol</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        {selected.length > 0 && (
          <Btn variant="danger" size="sm" onClick={handleBulkDelete}><Trash2 className="w-3.5 h-3.5" />Delete ({selected.length})</Btn>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B313B]">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-amber-500"
                    checked={vehicles.length > 0 && selected.length === vehicles.length}
                    onChange={e => setSelected(e.target.checked ? vehicles.map(v => v.id) : [])}
                  />
                </th>
                {["Reg No.", "Vehicle", "Type", "Max Load", "Odometer", "Insurance Expiry", "Cost", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313B]">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="accent-amber-500"
                      checked={selected.includes(v.id)}
                      onChange={e => setSelected(e.target.checked ? [...selected, v.id] : selected.filter(s => s !== v.id))}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{v.regNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{v.name}</div>
                    <div className="text-xs text-gray-500">{v.model}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{v.type}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{v.maxCapacity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">{v.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono ${new Date(v.insuranceExpiry) < new Date() ? "text-red-400" : new Date(v.insuranceExpiry) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) ? "text-amber-400" : "text-gray-400"}`}>
                      {v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString().split('T')[0] : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">KES {Number(v.acquisitionCost).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => alert(`Vehicle ID: ${v.id}\nReg No: ${v.regNumber}\nName: ${v.name}\nModel: ${v.model}\nType: ${v.type}\nOdometer: ${v.odometer} km\nMax Capacity: ${v.maxCapacity} kg\nStatus: ${v.status}`)}
                        className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors"
                      ><Eye className="w-3.5 h-3.5" /></button>
                      <button
                        type="button"
                        onClick={() => handleEditClick(v)}
                        className={`p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors ${v.status === "Retired" ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={v.status === "Retired"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400 transition-colors"
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500 text-xs">
                    No vehicles found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2B313B]">
          <span className="text-xs text-gray-500">Showing {vehicles.length} of {totalVehicles} vehicles</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-semibold ${page === p ? "bg-amber-500 text-black" : "bg-[#1D2128] text-gray-400 hover:text-white"}`}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Vehicle Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowDrawer(false); resetForm(); }} />
          <form onSubmit={handleSaveVehicle} className="relative w-full max-w-lg bg-[#171A1F] border-l border-[#2B313B] h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B313B]">
              <div>
                <div className="text-base font-semibold text-white">{editingId ? "Edit Vehicle" : "Add New Vehicle"}</div>
                <div className="text-xs text-gray-500 mt-0.5">All fields are required unless marked optional</div>
              </div>
              <button type="button" onClick={() => { setShowDrawer(false); resetForm(); }} className="p-1.5 hover:bg-[#2B313B] rounded-lg text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 py-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Registration Number</label>
                <input
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value)}
                  placeholder="KCA 000X"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Must be unique (e.g., KCA 123A)</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mercedes Actros"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Model</label>
                <input
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. Actros 2545"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  {["Heavy Truck", "Medium Truck", "Pickup", "Van", "Bus"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  {["Diesel", "Petrol", "Electric", "Hybrid"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  disabled={status === "Retired" && editingId !== null}
                >
                  {editingId
                    ? ["Available", "On Trip", "In Shop", "Retired"].map(o => <option key={o}>{o}</option>)
                    : ["Available", "In Shop"].map(o => <option key={o}>{o}</option>)
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Max Capacity (kg)</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Odometer (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={e => setOdometer(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Acquisition Cost (KES)</label>
                  <input
                    type="number"
                    value={acquisitionCost}
                    onChange={e => setAcquisitionCost(e.target.value)}
                    placeholder="4200000"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Insurance Expiry</label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={e => setInsuranceExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle Photo (optional)</label>
                <div className="border-2 border-dashed border-[#2B313B] rounded-lg p-6 text-center hover:border-amber-500/30 transition-colors cursor-pointer">
                  <UploadCloud className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer border px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black border-amber-500 flex-1">Save Vehicle</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer border px-4 py-2 text-sm bg-[#2B313B] hover:bg-[#353d49] text-white border-[#2B313B]" onClick={() => { setShowDrawer(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DriverManagement() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [drivers, setDrivers] = useState<any[]>([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("Class GV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [phone, setPhone] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");
  const [status, setStatus] = useState("Available");
  const [experience, setExperience] = useState("");
  const [tripsCount, setTripsCount] = useState("0");
  const [incidentsCount, setIncidentsCount] = useState("0");
  const [rating, setRating] = useState("5.0");
  const [avatar, setAvatar] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const fetchDrivers = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        search,
        status: statusFilter,
        category: categoryFilter,
      });
      const res = await fetch(`http://localhost:5000/api/v1/drivers?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDrivers(json.data);
        setTotalDrivers(json.pagination.total);
        setTotalPages(json.pagination.totalPages);

        // Update the global DRIVERS array in-place so other components stay synchronized
        DRIVERS.length = 0;
        DRIVERS.push(...json.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          license: d.licenseNumber,
          category: d.licenseCategory,
          expiry: d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : "",
          safety: d.safetyScore,
          vehicle: d.vehicle || "—",
          status: d.status,
          experience: d.experience,
          phone: d.phone,
          trips: d.tripsCount,
          incidents: d.incidentsCount,
          rating: d.rating,
          avatar: d.avatar
        })));
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, statusFilter, categoryFilter]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setLicenseNumber("");
    setLicenseCategory("Class GV");
    setLicenseExpiry("");
    setPhone("");
    setSafetyScore("100");
    setStatus("Available");
    setExperience("");
    setTripsCount("0");
    setIncidentsCount("0");
    setRating("5.0");
    setAvatar("");
    setErrorMsg("");
  };

  const handleEditClick = (d: any) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNumber(d.licenseNumber);
    setLicenseCategory(d.licenseCategory);
    setLicenseExpiry(d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : "");
    setPhone(d.phone);
    setSafetyScore(d.safetyScore.toString());
    setStatus(d.status);
    setExperience(d.experience);
    setTripsCount(d.tripsCount.toString());
    setIncidentsCount(d.incidentsCount.toString());
    setRating(d.rating.toString());
    setAvatar(d.avatar);
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/drivers/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchDrivers();
      } else {
        alert(json.error?.message || "Failed to delete driver");
      }
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const computedAvatar = name
      ? name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
      : "D";

    const payload = {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      phone,
      safetyScore: Number(safetyScore),
      status,
      experience,
      tripsCount: Number(tripsCount),
      incidentsCount: Number(incidentsCount),
      rating: Number(rating),
      avatar: computedAvatar,
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:5000/api/v1/drivers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:5000/api/v1/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Failed to save driver");
        return;
      }

      setShowDrawer(false);
      resetForm();
      fetchDrivers();
    } catch (err) {
      console.error("Error saving driver:", err);
      setErrorMsg("Network error occurred.");
    }
  };

  function licenseColor(expiry: string) {
    if (!expiry) return "text-gray-400";
    const d = new Date(expiry);
    const now = new Date();
    if (d < now) return "text-red-400";
    if (d < new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)) return "text-amber-400";
    return "text-emerald-400";
  }

  return (
    <div>
      <SectionHeader
        title="Driver Management"
        subtitle={`${totalDrivers} drivers registered`}
        action={
          <div className="flex gap-2">
            <div className="flex bg-[#1D2128] border border-[#2B313B] rounded-lg overflow-hidden">
              {(["cards", "table"] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${view === v ? "bg-[#2B313B] text-white" : "text-gray-500 hover:text-gray-300"}`}
                >{v}</button>
              ))}
            </div>
            <Btn size="sm" onClick={() => { resetForm(); setShowDrawer(true); }}><Plus className="w-3.5 h-3.5" />Add Driver</Btn>
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar
          placeholder="Search drivers…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="Class GV">Class GV</option>
          <option value="Class C">Class C</option>
          <option value="Class B">Class B</option>
          <option value="Class A">Class A</option>
        </select>
      </div>

      {view === "cards" ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(d => (
              <div key={d.id} className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-5 hover:border-amber-500/30 transition-all group relative">
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEditClick(d)}
                    className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors"
                  ><Edit2 className="w-3.5 h-3.5" /></button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400 transition-colors"
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                      {d.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.licenseCategory}</div>
                    </div>
                  </div>
                  <div className="mr-8 group-hover:mr-16 transition-all">
                    <StatusBadge status={d.status} />
                  </div>
                </div>

                {/* Safety score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-500">Safety Score</span>
                    <span className={`text-sm font-bold ${d.safetyScore >= 90 ? "text-emerald-400" : d.safetyScore >= 75 ? "text-amber-400" : "text-red-400"}`}>{d.safetyScore}</span>
                  </div>
                  <div className="h-1.5 bg-[#2B313B] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.safetyScore >= 90 ? "bg-emerald-400" : d.safetyScore >= 75 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${d.safetyScore}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">Experience</span>
                    <div className="text-gray-300 font-medium mt-0.5">{d.experience}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Trips</span>
                    <div className="text-gray-300 font-medium mt-0.5">{d.tripsCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">License Expiry</span>
                    <div className={`font-mono font-medium mt-0.5 ${licenseColor(d.licenseExpiry)}`}>
                      {d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating</span>
                    <div className="text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />{d.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 border-t border-[#2B313B] pt-3">
                  <Phone className="w-3 h-3" />{d.phone}
                </div>

                {d.status === "Suspended" && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />Cannot be assigned to trips
                  </div>
                )}
                {d.licenseExpiry && new Date(d.licenseExpiry) < new Date() && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3 h-3" />License expired — reassignment blocked
                  </div>
                )}
              </div>
            ))}
            {drivers.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 text-xs bg-[#1D2128] border border-[#2B313B] rounded-xl">
                No drivers found matching search criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border border-[#2B313B] bg-[#1D2128] rounded-xl mt-4">
            <span className="text-xs text-gray-500">Showing {drivers.length} of {totalDrivers} drivers</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-semibold ${page === p ? "bg-amber-500 text-black" : "bg-[#1D2128] text-gray-400 hover:text-white"}`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B313B]">
                  {["Driver", "License No.", "Category", "License Expiry", "Safety Score", "Vehicle", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313B]">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">{d.avatar}</div>
                        <span className="font-medium text-white">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{d.licenseNumber}</td>
                    <td className="px-5 py-3 text-gray-400">{d.licenseCategory}</td>
                    <td className={`px-5 py-3 font-mono text-xs ${licenseColor(d.licenseExpiry)}`}>
                      {d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${d.safetyScore >= 90 ? "text-emerald-400" : d.safetyScore >= 75 ? "text-amber-400" : "text-red-400"}`}>{d.safetyScore}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{d.vehicle || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => alert(`Driver ID: ${d.id}\nName: ${d.name}\nLicense: ${d.licenseNumber}\nCategory: ${d.licenseCategory}\nExpiry: ${d.licenseExpiry}\nSafety: ${d.safetyScore}\nPhone: ${d.phone}\nStatus: ${d.status}`)}
                          className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors"
                        ><Eye className="w-3.5 h-3.5" /></button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(d)}
                          className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors"
                        ><Edit2 className="w-3.5 h-3.5" /></button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400 transition-colors"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-8 text-center text-gray-500 text-xs">
                      No drivers found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#2B313B]">
            <span className="text-xs text-gray-500">Showing {drivers.length} of {totalDrivers} drivers</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-semibold ${page === p ? "bg-amber-500 text-black" : "bg-[#1D2128] text-gray-400 hover:text-white"}`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Driver Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowDrawer(false); resetForm(); }} />
          <form onSubmit={handleSaveDriver} className="relative w-full max-w-lg bg-[#171A1F] border-l border-[#2B313B] h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B313B]">
              <div>
                <div className="text-base font-semibold text-white">{editingId ? "Edit Driver Details" : "Add New Driver"}</div>
                <div className="text-xs text-gray-500 mt-0.5">All fields are required unless marked optional</div>
              </div>
              <button type="button" onClick={() => { setShowDrawer(false); resetForm(); }} className="p-1.5 hover:bg-[#2B313B] rounded-lg text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. James Mwangi"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">License Number</label>
                <input
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="DL-2019-00123"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Must be unique</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">License Category</label>
                <select
                  value={licenseCategory}
                  onChange={e => setLicenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  {["Class GV", "Class C", "Class B", "Class A"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">License Expiry Date</label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={e => setLicenseExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +254 712 345678"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Driver Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  {["Available", "On Trip", "Off Duty", "Suspended"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Safety Score (0-100)</label>
                  <input
                    type="number"
                    value={safetyScore}
                    onChange={e => setSafetyScore(e.target.value)}
                    placeholder="100"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Experience</label>
                  <input
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="e.g. 5 yrs"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Trips Count</label>
                  <input
                    type="number"
                    value={tripsCount}
                    onChange={e => setTripsCount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Incidents Count</label>
                  <input
                    type="number"
                    value={incidentsCount}
                    onChange={e => setIncidentsCount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  placeholder="5.0"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 bg-[#1D2128] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer border px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black border-amber-500 flex-1">Save Driver</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer border px-4 py-2 text-sm bg-[#2B313B] hover:bg-[#353d49] text-white border-[#2B313B]" onClick={() => { setShowDrawer(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function TripDispatcher() {
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [weight, setWeight] = useState("");
  const [cargo, setCargo] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [tripsList, setTripsList] = useState<any[]>([]);

  const steps = ["Draft", "Validation", "Dispatch", "In Progress", "Completed"];

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("http://localhost:5000/api/v1/vehicles"),
        fetch("http://localhost:5000/api/v1/drivers")
      ]);
      const vJson = await vRes.json();
      const dJson = await dRes.json();
      if (vJson.success) setVehiclesList(vJson.data);
      if (dJson.success) setDriversList(dJson.data);
    } catch (err) {
      console.error("Error fetching vehicles and drivers:", err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/trips?limit=100");
      const json = await res.json();
      if (json.success) {
        setTripsList(json.data);

        // Update the global TRIPS array in-place so other components stay synchronized automatically
        TRIPS.length = 0;
        TRIPS.push(...json.data.map((t: any) => ({
          id: t.tripId,
          vehicle: t.vehicle?.regNumber || "—",
          driver: t.driver?.name || "—",
          origin: t.origin,
          destination: t.destination,
          status: t.status,
          eta: t.eta || "—",
          distance: t.distance || "—",
          cargo: t.cargo,
          weight: t.weight,
          priority: t.priority
        })));
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  useEffect(() => {
    fetchVehiclesAndDrivers();
    fetchTrips();
  }, []);

  const availableVehicles = vehiclesList.filter(v => v.status === "Available");
  const availableDrivers = driversList.filter(d => d.status === "Available" && new Date(d.licenseExpiry) > new Date());

  const handleCreateTrip = async (status: 'Scheduled' | 'In Progress' | 'Draft') => {
    setErrors([]);
    const vObj = vehiclesList.find(x => x.regNumber === vehicle);
    const dObj = driversList.find(x => x.name === driver);

    if (!vehicle) {
      setErrors(["Please select a vehicle."]);
      return;
    }
    if (!driver) {
      setErrors(["Please select a driver."]);
      return;
    }
    if (!vObj) {
      setErrors(["Selected vehicle not found in database."]);
      return;
    }
    if (!dObj) {
      setErrors(["Selected driver not found in database."]);
      return;
    }

    const wNum = Number(weight);
    if (isNaN(wNum) || wNum <= 0) {
      setErrors(["Cargo weight must be a positive number."]);
      return;
    }

    if (wNum > vObj.maxCapacity) {
      setErrors([`Cargo weight (${wNum.toLocaleString()} kg) exceeds vehicle capacity (${vObj.maxCapacity.toLocaleString()} kg).`]);
      return;
    }

    const payload = {
      vehicleId: vObj.id,
      driverId: dObj.id,
      origin: origin || "Nairobi",
      destination: destination || "Mombasa",
      cargo: cargo || "General Goods",
      weight: wNum,
      priority,
      status,
      notes,
      eta: pickupTime ? new Date(pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
      distance: "480 km",
    };

    try {
      const res = await fetch("http://localhost:5000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrors([json.error?.message || "Failed to save trip."]);
        return;
      }

      // Reset Form
      setOrigin("");
      setDestination("");
      setPickupTime("");
      setExpectedDelivery("");
      setVehicle("");
      setDriver("");
      setWeight("");
      setCargo("");
      setPriority("Normal");
      setNotes("");
      setStep(status === 'In Progress' ? 4 : 3);

      fetchTrips();
      fetchVehiclesAndDrivers();
    } catch (err) {
      console.error("Error saving trip:", err);
      setErrors(["Network error occurred."]);
    }
  };

  const handleDispatch = async (tripId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/dispatch`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to dispatch trip");
        return;
      }
      fetchTrips();
      fetchVehiclesAndDrivers();
    } catch (err) {
      console.error("Error dispatching trip:", err);
    }
  };

  const handleComplete = async (tripId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/complete`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to complete trip");
        return;
      }
      fetchTrips();
      fetchVehiclesAndDrivers();
    } catch (err) {
      console.error("Error completing trip:", err);
    }
  };

  const handleCancel = async (tripId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to cancel trip");
        return;
      }
      fetchTrips();
      fetchVehiclesAndDrivers();
    } catch (err) {
      console.error("Error cancelling trip:", err);
    }
  };

  return (
    <div>
      <SectionHeader title="Trip Dispatcher" subtitle="Plan, validate, and dispatch trips in real time" />

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i + 1 < step ? "bg-emerald-400 border-emerald-400 text-black" : i + 1 === step ? "bg-amber-500 border-amber-500 text-black" : "bg-transparent border-[#2B313B] text-gray-500"}`}>
                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? "text-amber-400" : i + 1 < step ? "text-emerald-400" : "text-gray-500"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-emerald-400" : "bg-[#2B313B]"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-6">
            <div className="text-sm font-semibold text-white mb-5">Trip Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Origin / Source</label>
                <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Nairobi CBD" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Destination</label>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Mombasa Port" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Pickup Time</label>
                <input type="datetime-local" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Expected Delivery</label>
                <input type="datetime-local" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>

              {/* Vehicle select */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle</label>
                <select value={vehicle} onChange={e => setVehicle(e.target.value)} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors">
                  <option value="">Select a vehicle</option>
                  {availableVehicles.map(v => <option key={v.id} value={v.regNumber}>{v.regNumber} — {v.name}</option>)}
                </select>
                {vehicle && (() => {
                  const v = vehiclesList.find(x => x.regNumber === vehicle);
                  return v ? <p className="text-xs text-gray-500 mt-1">Max capacity: {v.maxCapacity.toLocaleString()} kg</p> : null;
                })()}
              </div>

              {/* Driver select */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Driver</label>
                <select value={driver} onChange={e => setDriver(e.target.value)} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors">
                  <option value="">Select a driver</option>
                  {availableDrivers.map(d => <option key={d.id} value={d.name}>{d.name} — {d.licenseCategory}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cargo Weight (kg)</label>
                <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18500" className={`w-full px-3 py-2.5 bg-[#0F1115] border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${weight && vehicle && vehiclesList.find(v => v.regNumber === vehicle) && parseInt(weight) > (vehiclesList.find(v => v.regNumber === vehicle)?.maxCapacity || 0) ? "border-red-500/50 focus:border-red-500" : "border-[#2B313B] focus:border-amber-500/50"}`} />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cargo Description</label>
                <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="e.g. Electronics" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors">
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Handling instructions, special requirements…" className="w-full px-3 py-2.5 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none" />
            </div>

            {/* Validation errors */}
            {errors.length > 0 && (
              <div className="mt-4 space-y-2">
                {errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{e}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Btn onClick={() => handleCreateTrip('In Progress')}><Zap className="w-3.5 h-3.5" />Validate & Dispatch</Btn>
              <Btn variant="secondary" onClick={() => handleCreateTrip('Scheduled')}>Save as Draft</Btn>
            </div>
          </div>

          {/* Business rules banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300 space-y-1.5">
            <div className="font-semibold text-blue-400 mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />Business Rules Active</div>
            {[
              "Retired and In Shop vehicles are hidden from dispatch selection",
              "Drivers with expired licenses or Suspended status are excluded",
              "Cargo weight is validated against vehicle maximum capacity",
              "Dispatching a trip sets both driver and vehicle to On Trip status",
            ].map(r => <div key={r} className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />{r}</div>)}
          </div>
        </div>

        {/* Sidebar: Dispatch Timeline */}
        <div className="space-y-4">
          {/* Live Validation */}
          <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-5">
            <div className="text-sm font-semibold text-white mb-4">Live Validation</div>
            <div className="space-y-2.5">
              {[
                { label: "Vehicle Available", ok: !!vehicle, na: !vehicle },
                { label: "Driver Available", ok: !!driver, na: !driver },
                { label: "Capacity OK", ok: !!(weight && vehicle && parseInt(weight) <= (vehiclesList.find(v => v.regNumber === vehicle)?.maxCapacity || 0)), na: !weight || !vehicle, err: !!(weight && vehicle && parseInt(weight) > (vehiclesList.find(v => v.regNumber === vehicle)?.maxCapacity || 0)) },
                { label: "License Valid", ok: !!(driver && availableDrivers.find(d => d.name === driver)), na: !driver },
                { label: "No Active Trips", ok: true, na: false },
              ].map(v => (
                <div key={v.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{v.label}</span>
                  {v.na ? <span className="text-xs text-gray-600 font-mono">—</span>
                    : v.err ? <XCircle className="w-4 h-4 text-red-400" />
                      : v.ok ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Active Trips */}
          <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-5">
            <div className="text-sm font-semibold text-white mb-4">Active Trips</div>
            <div className="space-y-3">
              {tripsList.filter(t => t.status === "In Progress").map(t => (
                <div key={t.id} className="p-3 bg-[#0F1115] border border-[#2B313B] rounded-lg">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-mono text-xs text-amber-400">{t.tripId}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-gray-400">{t.origin} → {t.destination}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.driver?.name} · {t.vehicle?.regNumber}</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />ETA {t.eta}</div>
                </div>
              ))}
              {tripsList.filter(t => t.status === "In Progress").length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No trips currently in progress.</p>
              )}
            </div>
          </div>

          {/* Scheduled Trips */}
          <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-5">
            <div className="text-sm font-semibold text-white mb-4">Upcoming Trips</div>
            <div className="space-y-3">
              {tripsList.filter(t => t.status === "Scheduled").map(t => (
                <div key={t.id} className="p-3 bg-[#0F1115] border border-[#2B313B] rounded-lg">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-mono text-xs text-amber-400">{t.tripId}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-gray-400">{t.origin} → {t.destination}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.driver?.name} · {t.vehicle?.regNumber}</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />ETA {t.eta}</div>
                </div>
              ))}
              {tripsList.filter(t => t.status === "Scheduled").length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No scheduled upcoming trips.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="mt-6 bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2B313B] text-sm font-semibold text-white">All Trips</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B313B]">
                {["Trip ID", "Vehicle", "Driver", "Route", "Cargo", "Status", "Priority", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313B]">
              {tripsList.map(t => (
                <tr key={t.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                  <td className="px-5 py-3 font-mono text-xs text-amber-400">{t.tripId}</td>
                  <td className="px-5 py-3 text-white">{t.vehicle?.regNumber || "—"}</td>
                  <td className="px-5 py-3 text-gray-300">{t.driver?.name || "—"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.origin} → {t.destination}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.weight.toLocaleString()} kg</td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${t.priority === "Urgent" ? "text-red-400" : t.priority === "High" ? "text-amber-400" : "text-gray-400"}`}>{t.priority}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {(t.status === "Scheduled" || t.status === "Draft") && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDispatch(t.id)}
                            title="Dispatch Trip"
                            className="p-1 hover:bg-[#2B313B] rounded text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(t.id)}
                            title="Cancel Trip"
                            className="p-1 hover:bg-[#2B313B] rounded text-red-400 hover:text-red-300 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {t.status === "In Progress" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleComplete(t.id)}
                            title="Complete Trip"
                            className="p-1 hover:bg-[#2B313B] rounded text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(t.id)}
                            title="Cancel Trip"
                            className="p-1 hover:bg-[#2B313B] rounded text-red-400 hover:text-red-300 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => alert(`Trip Details:\nTrip ID: ${t.tripId}\nRoute: ${t.origin} -> ${t.destination}\nCargo: ${t.cargo} (${t.weight} kg)\nDriver: ${t.driver?.name}\nVehicle: ${t.vehicle?.regNumber}\nStatus: ${t.status}\nPriority: ${t.priority}\nNotes: ${t.notes || "—"}`)}
                        title="View Details"
                        className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tripsList.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-gray-500 text-xs">
                    No trips registered in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MaintenanceMod() {
  const [showForm, setShowForm] = useState(false);
  const [recordsList, setRecordsList] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Form states
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState("");
  const [technician, setTechnician] = useState("");
  const [category, setCategory] = useState("Mechanical");
  const [priority, setPriority] = useState("Normal");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/vehicles");
      const json = await res.json();
      if (json.success) {
        setVehiclesList(json.data);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: "100",
        search,
        status: statusFilter,
        category: categoryFilter,
      });
      const res = await fetch(`http://localhost:5000/api/v1/maintenance?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecordsList(json.data);

        // Update global MAINTENANCE constant in-place so other components stay synchronized
        MAINTENANCE.length = 0;
        MAINTENANCE.push(...json.data.map((m: any) => ({
          id: m.maintenanceId,
          vehicle: `${m.vehicle?.regNumber} — ${m.vehicle?.name}`,
          type: m.type,
          category: m.category,
          priority: m.priority,
          cost: Number(m.cost),
          technician: m.technician,
          date: m.date ? new Date(m.date).toISOString().split('T')[0] : "",
          status: m.status,
          notes: m.notes
        })));
      }
    } catch (err) {
      console.error("Error fetching maintenance:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchMaintenance();
  }, [search, statusFilter, categoryFilter]);

  const handleScheduleService = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!vehicleId) {
      setErrors(["Please select a vehicle."]);
      return;
    }

    const payload = {
      vehicleId,
      type,
      category,
      priority,
      cost: Number(cost) || 0,
      technician,
      date: date || new Date().toISOString().split('T')[0],
      notes,
      status: "Scheduled"
    };

    try {
      const res = await fetch("http://localhost:5000/api/v1/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrors([json.error?.message || "Failed to schedule service."]);
        return;
      }

      setShowForm(false);
      setVehicleId("");
      setType("");
      setTechnician("");
      setCategory("Mechanical");
      setPriority("Normal");
      setCost("");
      setDate("");
      setNotes("");

      fetchMaintenance();
      fetchVehicles();
    } catch (err) {
      console.error("Error scheduling service:", err);
      setErrors(["Network error occurred."]);
    }
  };

  const handleStartService = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Progress" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to start service");
        return;
      }
      fetchMaintenance();
      fetchVehicles();
    } catch (err) {
      console.error("Error starting service:", err);
    }
  };

  const handleCompleteService = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Failed to complete service");
        return;
      }
      fetchMaintenance();
      fetchVehicles();
    } catch (err) {
      console.error("Error completing service:", err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/maintenance/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchMaintenance();
        fetchVehicles();
      } else {
        alert(json.error?.message || "Failed to delete record");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Maintenance"
        subtitle="Service scheduling and history"
        action={
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-3.5 h-3.5" />Schedule Service</Btn>
          </div>
        }
      />

      {/* Business rule banner */}
      <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-xs text-amber-300">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>When a maintenance record is set to <strong>In Progress</strong>, the vehicle status is automatically updated to <strong>In Shop</strong> and removed from dispatch selection. When it ends (Completed), the vehicle status reverts to <strong>Available</strong>.</span>
      </div>

      <div className={`grid gap-6 ${showForm ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        {/* Service Form */}
        {showForm && (
          <form onSubmit={handleScheduleService} className="bg-[#1D2128] border border-amber-500/30 rounded-xl p-5 h-fit">
            <div className="text-sm font-semibold text-white mb-4">Schedule New Service</div>
            
            {errors.length > 0 && (
              <div className="mb-3 space-y-1">
                {errors.map((e, idx) => (
                  <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                    {e}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle</label>
                <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" required>
                  <option value="">Select vehicle</option>
                  {vehiclesList.filter(v => v.status !== "Retired").map(v => (
                    <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Issue / Service Type</label>
                <input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Oil Change, Brake Service" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" required />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Technician</label>
                <input value={technician} onChange={e => setTechnician(e.target.value)} placeholder="Assigned technician" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                    {["Mechanical", "Brakes", "Tyres", "Electrical", "Inspection", "Servicing"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Estimated Cost (KES)</label>
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Scheduled Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Service Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all border px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black border-amber-500">Schedule</button>
                <Btn type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
              </div>
            </div>
          </form>
        )}

        {/* Service History Table */}
        <div className={showForm ? "lg:col-span-2" : ""}>
          <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B313B]">
              <span className="text-sm font-semibold text-white">Service Records</span>
              <SearchBar placeholder="Search records…" value={search} onChange={e => setSearch(e.target.value)} className="w-52" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2B313B]">
                    {["ID", "Vehicle", "Service Type", "Category", "Priority", "Cost", "Technician", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B313B]">
                  {recordsList.map(m => (
                    <tr key={m.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                      <td className="px-5 py-3 font-mono text-xs text-amber-400">{m.maintenanceId}</td>
                      <td className="px-5 py-3 text-white text-xs">{m.vehicle?.regNumber} — {m.vehicle?.name}</td>
                      <td className="px-5 py-3 text-gray-300">{m.type}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{m.category}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${m.priority === "High" ? "text-red-400" : m.priority === "Critical" ? "text-red-500" : "text-gray-400"}`}>{m.priority}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs">KES {Number(m.cost).toLocaleString()}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{m.technician}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{m.date ? new Date(m.date).toISOString().split('T')[0] : "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(m.status === "Scheduled" || m.status === "Overdue") && (
                            <button
                              type="button"
                              onClick={() => handleStartService(m.id)}
                              title="Start Service"
                              className="p-1 hover:bg-[#2B313B] rounded text-emerald-400 hover:text-emerald-300"
                            ><Play className="w-3.5 h-3.5" /></button>
                          )}
                          {m.status === "In Progress" && (
                            <button
                              type="button"
                              onClick={() => handleCompleteService(m.id)}
                              title="Complete Service"
                              className="p-1 hover:bg-[#2B313B] rounded text-emerald-400 hover:text-emerald-300"
                            ><CheckCircle className="w-3.5 h-3.5" /></button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(m.id)}
                            title="Delete Record"
                            className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recordsList.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-5 py-8 text-center text-gray-500 text-xs">
                        No maintenance records found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming maintenance timeline */}
      <div className="mt-6 bg-[#1D2128] border border-[#2B313B] rounded-xl p-5">
        <div className="text-sm font-semibold text-white mb-4">Upcoming Maintenance Timeline</div>
        <div className="space-y-3">
          {recordsList.filter(m => m.status === "Scheduled").map(m => (
            <div key={m.id} className="flex items-center gap-4">
              <div className="w-20 text-xs text-gray-500 font-mono text-right shrink-0">{m.date ? new Date(m.date).toISOString().split('T')[0] : ""}</div>
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 p-3 bg-[#0F1115] border border-[#2B313B] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{m.type}</span>
                  <span className="text-xs text-gray-500">{m.vehicle?.regNumber}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">KES {Number(m.cost).toLocaleString()} · {m.technician}</div>
              </div>
            </div>
          ))}
          {recordsList.filter(m => m.status === "Scheduled").length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">No upcoming maintenance scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FuelExpenses() {
  const [activeTab, setActiveTab] = useState<"fuel" | "expenses">("fuel");
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Lists from backend
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Search and Filter states
  const [search, setSearch] = useState("");

  // Chart data states
  const [monthlyCosts, setMonthlyCosts] = useState<any[]>([]);
  const [pieCosts, setPieCosts] = useState<any[]>([]);
  const [consumptionLiters, setConsumptionLiters] = useState<any[]>([]);

  // Summary Metrics states
  const [metrics, setMetrics] = useState({
    todayFuelCost: 0,
    monthlyExpense: 0,
    maintenanceCost: 0,
    avgFuelEfficiency: "3.2 km/L"
  });

  // Form states - Fuel Log
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelDriverId, setFuelDriverId] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelStation, setFuelStation] = useState("");
  const [fuelDate, setFuelDate] = useState("");

  // Form states - Expense
  const [expVehicleId, setExpVehicleId] = useState("");
  const [expType, setExpType] = useState<"Fuel" | "Maintenance" | "Toll" | "Insurance" | "Repair" | "Other">("Toll");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expReceipt, setExpReceipt] = useState("");
  const [expStatus, setExpStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [expDate, setExpDate] = useState("");

  const fetchMetrics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/expenses/metrics");
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/expenses/charts");
      const json = await res.json();
      if (json.success) {
        setMonthlyCosts(json.data.monthlyExpenseData);
        setPieCosts(json.data.expensePieData);
        setConsumptionLiters(json.data.fuelConsumptionData);

        // Sync global charts data in-place so Reports and Dashboard stay in sync
        monthlyExpenseData.length = 0;
        monthlyExpenseData.push(...json.data.monthlyExpenseData);

        expensePieData.length = 0;
        expensePieData.push(...json.data.expensePieData);

        fuelConsumptionData.length = 0;
        fuelConsumptionData.push(...json.data.fuelConsumptionData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      const resV = await fetch("http://localhost:5000/api/v1/vehicles");
      const jsonV = await resV.json();
      if (jsonV.success) setVehicles(jsonV.data);

      const resD = await fetch("http://localhost:5000/api/v1/drivers");
      const jsonD = await resD.json();
      if (jsonD.success) setDrivers(jsonD.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: "100",
        search,
      });
      const res = await fetch(`http://localhost:5000/api/v1/fuel-logs?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFuelLogs(json.data);

        // Sync global FUEL_LOGS in-place
        FUEL_LOGS.length = 0;
        FUEL_LOGS.push(...json.data.map((f: any) => ({
          id: f.fuelLogId,
          vehicle: f.vehicle?.regNumber || "—",
          driver: f.driver?.name || "—",
          liters: f.liters,
          cost: Number(f.cost),
          date: f.date ? new Date(f.date).toISOString().split('T')[0] : "",
          odometer: f.odometer,
          station: f.station,
          efficiency: f.efficiency
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: "100",
        search,
      });
      const res = await fetch(`http://localhost:5000/api/v1/expenses?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setExpenses(json.data);

        // Sync global EXPENSES in-place
        EXPENSES.length = 0;
        EXPENSES.push(...json.data.map((e: any) => ({
          id: e.expenseId,
          vehicle: e.vehicle?.regNumber || "—",
          type: e.type,
          description: e.description,
          amount: Number(e.amount),
          receipt: e.receipt,
          status: e.status,
          date: e.date ? new Date(e.date).toISOString().split('T')[0] : ""
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchCharts();
    fetchVehiclesAndDrivers();
  }, []);

  useEffect(() => {
    if (activeTab === "fuel") {
      fetchLogs();
    } else {
      fetchExpenses();
    }
  }, [activeTab, search]);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      vehicleId: fuelVehicleId,
      driverId: fuelDriverId,
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      odometer: Number(fuelOdometer),
      station: fuelStation,
      date: fuelDate || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch("http://localhost:5000/api/v1/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrors([json.error?.message || "Failed to log fuel refuel."]);
        return;
      }

      setShowForm(false);
      setFuelVehicleId("");
      setFuelDriverId("");
      setFuelLiters("");
      setFuelCost("");
      setFuelOdometer("");
      setFuelStation("");
      setFuelDate("");

      fetchLogs();
      fetchMetrics();
      fetchCharts();
    } catch (err) {
      console.error(err);
      setErrors(["Network error occurred."]);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      vehicleId: expVehicleId,
      type: expType,
      description: expDescription,
      amount: Number(expAmount),
      receipt: expReceipt || `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: expStatus,
      date: expDate || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch("http://localhost:5000/api/v1/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrors([json.error?.message || "Failed to log expense record."]);
        return;
      }

      setShowForm(false);
      setExpVehicleId("");
      setExpType("Toll");
      setExpDescription("");
      setExpAmount("");
      setExpReceipt("");
      setExpStatus("Pending");
      setExpDate("");

      fetchExpenses();
      fetchMetrics();
      fetchCharts();
    } catch (err) {
      console.error(err);
      setErrors(["Network error occurred."]);
    }
  };

  const handleDeleteFuelLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fuel log? This will also delete the associated fuel expense.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/fuel-logs/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchLogs();
        fetchMetrics();
        fetchCharts();
      } else {
        alert(json.error?.message || "Failed to delete fuel log");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/expenses/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchExpenses();
        fetchMetrics();
        fetchCharts();
      } else {
        alert(json.error?.message || "Failed to delete expense record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeKpis = [
    { label: "Today's Fuel Cost", value: `KES ${(metrics.todayFuelCost).toLocaleString()}`, icon: Fuel, trend: "live today", trendUp: false },
    { label: "Monthly Expense", value: `KES ${(metrics.monthlyExpense).toLocaleString()}`, icon: DollarSign, trend: "this month", trendUp: false },
    { label: "Avg Fuel Efficiency", value: metrics.avgFuelEfficiency, icon: Gauge, trend: "fleet average", trendUp: true },
    { label: "Maintenance Cost", value: `KES ${(metrics.maintenanceCost).toLocaleString()}`, icon: Wrench, trend: "this month", trendUp: false },
  ];

  return (
    <div>
      <SectionHeader
        title="Fuel & Expenses"
        subtitle="Operational cost tracking and analytics"
        action={
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-3.5 h-3.5" />Log Entry</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {activeKpis.map(m => <KpiCard key={m.label} {...m} sub="" />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Monthly Operational Cost (KES)" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyCosts.length > 0 ? monthlyCosts : monthlyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `KES ${v.toLocaleString()}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
              <Bar dataKey="fuel" name="Fuel" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill="#3B82F6" stackId="a" />
              <Bar dataKey="other" name="Other" fill="#8B5CF6" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <RePieChart>
              <Pie data={pieCosts.length > 0 ? pieCosts : expensePieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {(pieCosts.length > 0 ? pieCosts : expensePieData).map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `KES ${v.toLocaleString()}`} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {(pieCosts.length > 0 ? pieCosts : expensePieData).map(e => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                {e.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {showForm && (
        <div className="mb-6 bg-[#1D2128] border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-[#2B313B] pb-3">
            <span className="text-sm font-semibold text-white">Log {activeTab === "fuel" ? "Fuel Refuel" : "Expense Entry"}</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 space-y-1">
              {errors.map((e, idx) => (
                <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                  {e}
                </div>
              ))}
            </div>
          )}

          {activeTab === "fuel" ? (
            <form onSubmit={handleLogFuel} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle</label>
                <select value={fuelVehicleId} onChange={e => setFuelVehicleId(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none" required>
                  <option value="">Select vehicle</option>
                  {vehicles.filter(v => v.status !== "Retired").map(v => (
                    <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Driver</label>
                <select value={fuelDriverId} onChange={e => setFuelDriverId(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none" required>
                  <option value="">Select driver</option>
                  {drivers.filter(d => d.status !== "Suspended").map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Liters</label>
                <input type="number" step="any" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} placeholder="0.0" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cost (KES)</label>
                <input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Odometer (km)</label>
                <input type="number" value={fuelOdometer} onChange={e => setFuelOdometer(e.target.value)} placeholder="Current Odometer" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Station</label>
                <input value={fuelStation} onChange={e => setFuelStation(e.target.value)} placeholder="e.g. Shell Westlands" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Date</label>
                <input type="date" value={fuelDate} onChange={e => setFuelDate(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all border px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black border-amber-500">Log Refuel</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Vehicle</label>
                <select value={expVehicleId} onChange={e => setExpVehicleId(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none" required>
                  <option value="">Select vehicle</option>
                  {vehicles.filter(v => v.status !== "Retired").map(v => (
                    <option key={v.id} value={v.id}>{v.regNumber} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Type</label>
                <select value={expType} onChange={e => setExpType(e.target.value as any)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none">
                  {["Maintenance", "Toll", "Insurance", "Repair", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description</label>
                <input value={expDescription} onChange={e => setExpDescription(e.target.value)} placeholder="e.g. Expressway toll fee" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Amount (KES)</label>
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Receipt Code</label>
                <input value={expReceipt} onChange={e => setExpReceipt(e.target.value)} placeholder="e.g. RCP-3450" className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Status</label>
                <select value={expStatus} onChange={e => setExpStatus(e.target.value as any)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Date</label>
                <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all border px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black border-amber-500">Log Expense</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#2B313B] mb-4">
        {(["fuel", "expenses"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === t ? "border-amber-500 text-amber-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
            {t === "fuel" ? "Fuel Logs" : "Expense Records"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchBar placeholder={`Search ${activeTab}…`} value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
      </div>

      {activeTab === "fuel" ? (
        <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B313B]">
                  {["ID", "Vehicle", "Driver", "Liters", "Cost (KES)", "Efficiency", "Station", "Date", "Odometer", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313B]">
                {fuelLogs.map(f => (
                  <tr key={f.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-amber-400">{f.fuelLogId}</td>
                    <td className="px-5 py-3 text-white text-xs">{f.vehicle?.regNumber} — {f.vehicle?.name}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{f.driver?.name}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{f.liters}L</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">KES {Number(f.cost).toLocaleString()}</td>
                    <td className="px-5 py-3 text-emerald-400 text-xs">{f.efficiency}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{f.station}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{f.date ? new Date(f.date).toISOString().split('T')[0] : "—"}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{Number(f.odometer).toLocaleString()} km</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteFuelLog(f.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400 transition-opacity"
                        title="Delete Fuel Log"
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-8 text-center text-gray-500 text-xs">
                      No fuel logs logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2B313B]">
                  {["ID", "Vehicle", "Type", "Description", "Amount (KES)", "Receipt", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313B]">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-[#2B313B]/40 transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-amber-400">{e.expenseId}</td>
                    <td className="px-5 py-3 text-white text-xs">{e.vehicle?.regNumber} — {e.vehicle?.name}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-[#2B313B] text-gray-300 rounded-md">{e.type}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{e.description}</td>
                    <td className="px-5 py-3 text-gray-300 font-medium text-xs">KES {Number(e.amount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-blue-400 text-xs underline cursor-pointer">{e.receipt}</td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{e.date ? new Date(e.date).toISOString().split('T')[0] : "—"}</td>
                    <td className="px-5 py-3">
                      {!e.fuelLogId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(e.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400 transition-opacity"
                          title="Delete Expense Record"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-gray-500 text-xs">
                      No expense records logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [costlyVehicles, setCostlyVehicles] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      const resK = await fetch("http://localhost:5000/api/v1/reports/kpis");
      const jsonK = await resK.json();
      if (jsonK.success) setKpis(jsonK.data);

      const resC = await fetch("http://localhost:5000/api/v1/reports/charts");
      const jsonC = await resC.json();
      if (jsonC.success) setCharts(jsonC.data);

      const resT = await fetch("http://localhost:5000/api/v1/reports/top-costly-vehicles");
      const jsonT = await resT.json();
      if (jsonT.success) setCostlyVehicles(jsonT.data);
    } catch (err) {
      console.error("Error loading reports data:", err);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportCsv = () => {
    window.open("http://localhost:5000/api/v1/reports/export/csv", "_blank");
  };

  const handleExportPdf = () => {
    window.open("http://localhost:5000/api/v1/reports/export/pdf", "_blank");
  };

  const reportKpis = [
    { label: "Fleet Utilization", value: kpis ? kpis.fleetUtilization : "83%", sub: "6-month avg: 76%", icon: Gauge, trend: "+7% this period", trendUp: true },
    { label: "Operational Cost", value: kpis ? kpis.operationalCost : "KES 709K", sub: "Approved expenses", icon: DollarSign, trend: "+3% vs Dec", trendUp: false },
    { label: "Avg Fuel Efficiency", value: kpis ? kpis.avgFuelEfficiency : "3.2 km/L", sub: "fleet average", icon: Fuel, trend: "+0.2 improvement", trendUp: true },
    { label: "Vehicle ROI", value: kpis ? kpis.vehicleRoi : "142%", sub: "avg across fleet", icon: TrendingUp, trend: "highest: KCF 890E", trendUp: true },
  ];

  return (
    <div>
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Executive performance overview"
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={handleExportPdf}>
              <Download className="w-3.5 h-3.5" />Export PDF
            </Btn>
            <Btn variant="secondary" size="sm" onClick={handleExportCsv}>
              <Download className="w-3.5 h-3.5" />Export CSV
            </Btn>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors">
              <Calendar className="w-3.5 h-3.5" />Jan 2025<ChevronDown className="w-3 h-3" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {reportKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Monthly Cost Trend (KES)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts ? charts.monthlyExpenseData : monthlyExpenseData}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={2} fill="url(#costGrad)" dot={false} name="Fuel" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel Consumption (Liters)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts ? charts.fuelConsumptionData : fuelConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="liters" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", strokeWidth: 0, r: 4 }} name="Liters" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Utilization Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts ? charts.utilizationData : utilizationData}>
              <defs>
                <linearGradient id="utilGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[50, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="utilization" stroke="#F59E0B" strokeWidth={2} fill="url(#utilGrad2)" dot={false} name="Utilization %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Driver Performance Score">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts ? charts.driverPerformanceData : driverPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2B313B" />
              <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" fill="#F59E0B" radius={[0, 3, 3, 0]} name="Safety Score">
                {(charts ? charts.driverPerformanceData : driverPerformanceData).map((e: any, i: number) => <Cell key={i} fill={e.score >= 90 ? "#22C55E" : e.score >= 75 ? "#F59E0B" : "#EF4444"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Costly Vehicles */}
      <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2B313B] text-sm font-semibold text-white">Top Costly Vehicles (MTD)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B313B]">
                {["Vehicle", "Fuel Cost", "Maintenance", "Total Cost", "Utilization", "ROI"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313B]">
              {(costlyVehicles.length > 0 ? costlyVehicles : [
                { v: "KCA 441Z — Mercedes Actros", fuel: 31500, mnt: 0, util: "91%", roi: "168%" },
                { v: "KCD 234C — UD Trucks Quon", fuel: 38500, mnt: 28500, util: "88%", roi: "142%" },
                { v: "KCE 567D — Hino 700", fuel: 28000, mnt: 8500, util: "74%", roi: "118%" },
                { v: "KCB 112A — Isuzu FVR", fuel: 16625, mnt: 0, util: "66%", roi: "210%" },
                { v: "KCC 778B — Toyota Hilux", fuel: 0, mnt: 85000, util: "0%", roi: "—" },
              ]).map((r: any) => (
                <tr key={r.v} className="hover:bg-[#2B313B]/40 transition-colors">
                  <td className="px-5 py-3 text-white">{r.v}</td>
                  <td className="px-5 py-3 text-gray-300 text-xs">KES {Number(r.fuel).toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-300 text-xs">KES {Number(r.mnt).toLocaleString()}</td>
                  <td className="px-5 py-3 font-semibold text-white text-xs">KES {Number(r.fuel + r.mnt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-amber-400 text-xs">{r.util}</td>
                  <td className="px-5 py-3 text-emerald-400 text-xs">{r.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsModule() {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile" },
    { id: "org", label: "Organization" },
    { id: "rbac", label: "Roles & Permissions" },
    { id: "notifications", label: "Notifications" },
    { id: "users", label: "User Management" },
  ];

  const permissions = ["Dashboard", "Vehicles", "Drivers", "Trips", "Maintenance", "Fuel & Expenses", "Reports", "Analytics", "Audit Logs", "Settings"];
  const roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

  const rolePerms: Record<string, boolean[]> = {
    "Fleet Manager": [true, true, true, true, true, true, true, true, true, true],
    "Dispatcher": [true, true, true, true, false, false, false, false, false, false],
    "Safety Officer": [true, false, true, false, true, false, true, false, false, false],
    "Financial Analyst": [true, false, false, false, false, true, true, true, false, false],
  };

  const users = [
    { name: "James Mwangi", email: "j.mwangi@acmetransport.co.ke", role: "Fleet Manager", status: "Active" },
    { name: "Sarah Ochieng", email: "s.ochieng@acmetransport.co.ke", role: "Dispatcher", status: "Active" },
    { name: "Peter Kamau", email: "p.kamau@acmetransport.co.ke", role: "Dispatcher", status: "Active" },
    { name: "Grace Wanjiku", email: "g.wanjiku@acmetransport.co.ke", role: "Safety Officer", status: "Active" },
    { name: "David Otieno", email: "d.otieno@acmetransport.co.ke", role: "Dispatcher", status: "Suspended" },
  ];

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Account, organization, and platform configuration" />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === s.id ? "bg-amber-500/10 text-amber-400 font-medium" : "text-gray-400 hover:text-white hover:bg-[#2B313B]"}`}>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeSection === "profile" && (
            <div className="space-y-5">
              <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-6">
                <div className="text-sm font-semibold text-white mb-5">Profile Settings</div>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400">JM</div>
                  <div>
                    <Btn variant="secondary" size="sm"><UploadCloud className="w-3.5 h-3.5" />Change Avatar</Btn>
                    <p className="text-xs text-gray-600 mt-1.5">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ label: "Full Name", value: "James Mwangi" }, { label: "Email Address", value: "j.mwangi@acmetransport.co.ke" }, { label: "Phone", value: "+254 712 345678" }, { label: "Role", value: "Fleet Manager" }].map(f => (
                    <div key={f.label}>
                      <label className="text-xs font-medium text-gray-400 mb-1.5 block">{f.label}</label>
                      <input defaultValue={f.value} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Btn>Save Changes</Btn>
                </div>
              </div>
            </div>
          )}

          {activeSection === "rbac" && (
            <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2B313B] text-sm font-semibold text-white">Permissions Matrix</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#2B313B]">
                      <th className="text-left px-5 py-3 text-gray-500 font-medium uppercase tracking-wider">Permission</th>
                      {roles.map(r => <th key={r} className="px-4 py-3 text-center text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">{r}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B313B]">
                    {permissions.map((p, pi) => (
                      <tr key={p} className="hover:bg-[#2B313B]/40 transition-colors">
                        <td className="px-5 py-3 text-gray-300 font-medium">{p}</td>
                        {roles.map(r => (
                          <td key={r} className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              {rolePerms[r][pi]
                                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                : <div className="w-4 h-4 rounded border border-[#2B313B]" />}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "users" && (
            <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B313B]">
                <span className="text-sm font-semibold text-white">User Management</span>
                <Btn size="sm"><Plus className="w-3.5 h-3.5" />Invite User</Btn>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2B313B]">
                      {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B313B]">
                    {users.map(u => (
                      <tr key={u.email} className="hover:bg-[#2B313B]/40 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">
                              {u.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-0.5 bg-[#2B313B] text-gray-300 rounded-md">{u.role}</span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button className="p-1 hover:bg-[#2B313B] rounded text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeSection === "org" || activeSection === "notifications") && (
            <div className="bg-[#1D2128] border border-[#2B313B] rounded-xl p-6">
              <div className="text-sm font-semibold text-white mb-5">{sections.find(s => s.id === activeSection)?.label}</div>
              <div className="space-y-4">
                {activeSection === "org" && [
                  { label: "Organization Name", value: "Acme Transport Ltd" },
                  { label: "Country", value: "Kenya" },
                  { label: "Default Currency", value: "KES" },
                  { label: "Fiscal Year Start", value: "January" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2 bg-[#0F1115] border border-[#2B313B] rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                ))}
                {activeSection === "notifications" && (
                  <div className="space-y-3">
                    {["License expiry alerts (30 days)", "Maintenance overdue alerts", "High operational cost threshold", "Failed inspection notifications", "Trip completion summaries"].map(n => (
                      <div key={n} className="flex items-center justify-between p-3 bg-[#0F1115] border border-[#2B313B] rounded-lg">
                        <span className="text-sm text-gray-300">{n}</span>
                        <div className="w-9 h-5 bg-amber-500 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-black rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Btn>Save Changes</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

function MainLayout() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const pageComponents: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    fleet: <VehicleRegistry />,
    drivers: <DriverManagement />,
    trips: <TripDispatcher />,
    maintenance: <MaintenanceMod />,
    fuel: <FuelExpenses />,
    reports: <Reports />,
    settings: <SettingsModule />,
  };

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    fleet: "Vehicle Registry",
    drivers: "Driver Management",
    trips: "Trip Dispatcher",
    maintenance: "Maintenance",
    fuel: "Fuel & Expenses",
    reports: "Reports & Analytics",
    settings: "Settings",
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-14"} shrink-0 bg-[#171A1F] border-r border-[#2B313B] flex flex-col transition-all duration-200 fixed h-full z-30`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#2B313B]">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-black" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-sm font-bold text-white tracking-tight">TransitOps</div>
              <div className="text-[10px] text-gray-500">Acme Transport Ltd</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${active ? "bg-amber-500/10 text-amber-400 font-medium" : "text-gray-500 hover:text-white hover:bg-[#2B313B]"}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-400" : ""}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="w-4 h-4 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {active && <div className="absolute left-0 w-0.5 h-7 bg-amber-500 rounded-r" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[#2B313B] p-3">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "px-2" : "justify-center"}`}>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">JM</div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">James Mwangi</div>
                <div className="text-[10px] text-gray-500 truncate">Fleet Manager</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="w-full mt-2 flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#2B313B] transition-colors">
              <LogOut className="w-3.5 h-3.5" />Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? "ml-60" : "ml-14"} transition-all duration-200`}>
        {/* Top nav */}
        <header className="sticky top-0 z-20 h-14 bg-[#171A1F]/90 backdrop-blur border-b border-[#2B313B] flex items-center px-5 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-[#2B313B] rounded-lg text-gray-500 hover:text-white transition-colors">
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-600">TransitOps</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-white font-medium">{pageTitles[page]}</span>
          </div>

          <div className="flex-1" />

          {/* Global search */}
          <div className="relative hidden md:block w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input placeholder="Search…" className="w-full pl-8 pr-4 py-1.5 bg-[#1D2128] border border-[#2B313B] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono bg-[#2B313B] px-1 rounded">⌘K</kbd>
          </div>

          {/* Workspace switcher */}
          <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1D2128] border border-[#2B313B] text-xs text-gray-400 rounded-lg hover:border-gray-500 transition-colors">
            <Globe className="w-3.5 h-3.5" />Nairobi HQ<ChevronDown className="w-3 h-3" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 hover:bg-[#2B313B] rounded-lg text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#171A1F]" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-72 bg-[#1D2128] border border-[#2B313B] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2B313B] flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-amber-400">3 new</span>
                </div>
                <div className="divide-y divide-[#2B313B] max-h-64 overflow-y-auto">
                  {[
                    { icon: AlertTriangle, msg: "David Otieno's license has expired", time: "2h ago", color: "text-red-400" },
                    { icon: Wrench, msg: "KCC 778B engine overhaul started", time: "4h ago", color: "text-amber-400" },
                    { icon: CheckCircle, msg: "TR-8819 delivered successfully", time: "6h ago", color: "text-emerald-400" },
                  ].map((n, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 hover:bg-[#2B313B]/50 cursor-pointer">
                      <n.icon className={`w-4 h-4 shrink-0 mt-0.5 ${n.color}`} />
                      <div>
                        <div className="text-xs text-white">{n.msg}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">JM</div>
            <div className="hidden md:block text-right">
              <div className="text-xs font-medium text-white leading-tight">James Mwangi</div>
              <div className="text-[10px] text-gray-500">Fleet Manager</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {pageComponents[page]}
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [authed, setAuthed] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {authed ? <MainLayout /> : <AuthScreen onLogin={() => setAuthed(true)} />}
    </div>
  );
}
