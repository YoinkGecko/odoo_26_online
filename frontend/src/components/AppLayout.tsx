'use client';
import React, { useState } from 'react';
import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AppLayout({ children, activeRoute }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        activeRoute={activeRoute}
      />
      <main
        className="flex-1 overflow-y-auto min-w-0"
        style={{ marginLeft: 0 }}
      >
        {children}
      </main>
    </div>
    </AuthGuard>
  );
}