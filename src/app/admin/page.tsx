'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, CalendarDays, Image, Globe2, Settings2 } from 'lucide-react';
import DashboardCard from '@/app/components/admin/DashboardCard';
import PageHeader from '@/app/components/admin/PageHeader';

export default function AdminDashboardPage() {
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [homepageCount, setHomepageCount] = useState(0);

  useEffect(() => {
    void fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookingCount(data.length);
          setPendingCount(data.filter((item) => item.status === 'pending').length);
        }
      })
      .catch(() => undefined);

    void fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMediaCount(data.length);
          setHomepageCount(
            data.filter((item: any) => item.section === 'gallery' && item.type === 'homepage')
              .length
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const stats = useMemo(
    () => [
      {
        title: 'Total bookings',
        value: bookingCount,
        description: 'All reservations in the system.',
      },
      {
        title: 'Pending requests',
        value: pendingCount,
        description: 'New inquiries waiting for review.',
      },
      {
        title: 'Media assets',
        value: mediaCount,
        description: 'Images and visual assets available for the website.',
      },
      {
        title: 'Homepage gallery',
        value: homepageCount,
        description: 'Active homepage gallery items.',
      },
    ],
    [bookingCount, homepageCount, mediaCount, pendingCount]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your admin workspace for managing bookings, media, website content, and settings."
      />

      <div className="grid gap-6 xl:grid-cols-4">
        {stats.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <LayoutDashboard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Overview</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Use the sidebar to navigate between booking operations, media management, website
            content, and application settings. This dashboard helps you monitor pending guest
            inquiries and the current media library at a glance.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-slate-900">
              <CalendarDays className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Actionable items</h2>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Review bookings</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{pendingCount} pending</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Update media</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{mediaCount} assets</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-4 flex items-center gap-3 text-slate-900">
            <Image className="h-5 w-5" />
            <h3 className="text-base font-semibold">Media</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Manage the visual experience for the landing page and gallery from a single location.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-4 flex items-center gap-3 text-slate-900">
            <Globe2 className="h-5 w-5" />
            <h3 className="text-base font-semibold">Website</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Publish updates for content sections, amenities, and featured villa experiences in the
            website editor.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-4 flex items-center gap-3 text-slate-900">
            <Settings2 className="h-5 w-5" />
            <h3 className="text-base font-semibold">Settings</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Adjust branding and administrative preferences for the dashboard and site operations.
          </p>
        </div>
      </div>
    </div>
  );
}
