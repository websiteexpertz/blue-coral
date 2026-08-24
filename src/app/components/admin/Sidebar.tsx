'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Image, LayoutDashboard, Settings2, LogOut } from 'lucide-react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ items, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                Blue Coral
              </p>
              <p className="text-base font-semibold text-white">Admin</p>
            </div>
          </div>

          <nav className="mb-6 flex-1 space-y-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={onClose}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/5 bg-white/5 p-4 text-sm text-slate-400 shadow-inner">
            <div className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">Account</div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetch('/api/admin/logout', { method: 'POST' });
                } finally {
                  window.location.assign('/login');
                }
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
