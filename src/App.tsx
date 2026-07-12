import { useState } from 'react';
import { AuthProvider, useAuth, landingRoute } from './context/AuthContext';
import { Login } from './screens/Login';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './screens/Dashboard';
import { Fleet } from './screens/Fleet';
import { Drivers } from './screens/Drivers';
import { Trips } from './screens/Trips';
import { Maintenance } from './screens/Maintenance';
import { FuelExpenses } from './screens/FuelExpenses';
import { Analytics } from './screens/Analytics';
import { Settings } from './screens/Settings';
import { ModuleKey, canAccess, Role } from './types';

function Workspace() {
  const { user, logout } = useAuth();
  const [route, setRoute] = useState<string | null>(null);

  if (!user) return <Login />;

  const role = user.role as Role;
  const current = (route ?? landingRoute(role)) as ModuleKey;

  // Guard: if user lacks access to the module, redirect to their landing
  const safe = canAccess(role, current) ? current : (landingRoute(role) as ModuleKey);

  const navigate = (key: string) => {
    if (canAccess(role, key as ModuleKey)) setRoute(key);
  };

  const screens: Record<ModuleKey, React.ReactNode> = {
    dashboard: <Dashboard />,
    fleet: <Fleet role={role} />,
    drivers: <Drivers role={role} />,
    trips: <Trips role={role} />,
    maintenance: <Maintenance role={role} />,
    'fuel-expenses': <FuelExpenses role={role} />,
    analytics: <Analytics />,
    settings: <Settings />,
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar role={role} active={safe} onNavigate={navigate} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar module={safe} onLogout={logout} />
        <main className="flex-1 min-w-0">{screens[safe]}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  );
}
