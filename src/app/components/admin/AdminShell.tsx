'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { CalendarDays, Globe2, Image, LayoutDashboard, Settings2 } from 'lucide-react';
import Sidebar from '@/app/components/admin/Sidebar';
import Navbar from '@/app/components/admin/Navbar';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <CalendarDays className="h-5 w-5" /> },
  { href: '/admin/website', label: 'Website Content', icon: <Globe2 className="h-5 w-5" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings2 className="h-5 w-5" /> },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar items={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto border-l border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.08),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.98))] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
