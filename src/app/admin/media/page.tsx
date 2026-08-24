'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image, UploadCloud, Layers } from 'lucide-react';
import PageHeader from '@/app/components/admin/PageHeader';
import EmptyState from '@/app/components/admin/EmptyState';
import MediaManager from '@/app/components/media/MediaManager';

export default function AdminMediaPage() {
  const [mediaCount, setMediaCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [homepageCount, setHomepageCount] = useState(0);

  useEffect(() => {
    void fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMediaCount(data.length);
          setGalleryCount(data.filter((item: any) => item.section === 'gallery').length);
          setHomepageCount(
            data.filter((item: any) => item.section === 'gallery' && item.type === 'homepage')
              .length
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const sections = useMemo(
    () => [
      { label: 'All assets', value: mediaCount, icon: <Layers className="h-5 w-5" /> },
      { label: 'Gallery items', value: galleryCount, icon: <Image className="h-5 w-5" /> },
      {
        label: 'Homepage gallery',
        value: homepageCount,
        icon: <UploadCloud className="h-5 w-5" />,
      },
    ],
    [galleryCount, homepageCount, mediaCount]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Media library"
        description="Upload, sort, and organize the images used throughout the site, including the hero, gallery, and homepage sections."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.label}
            className="rounded-[2rem] border border-white/10 bg-white/95 p-5 shadow-[0_25px_80px_rgba(27,79,107,0.06)]"
          >
            <div className="flex items-center gap-3 text-slate-900">
              {section.icon}
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {section.label}
              </p>
            </div>
            <p className="mt-4 text-4xl font-semibold text-foreground">{section.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
        <div className="mb-6 flex items-center gap-3 text-slate-900">
          <UploadCloud className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Manage assets</h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Add or replace images in the visual library, then use the gallery section to control how
          items appear on the frontend.
        </p>
        <MediaManager />
      </div>

      {mediaCount === 0 ? (
        <EmptyState
          title="No media uploaded yet"
          description="Start by adding images to the library and then assign them to homepage or gallery sections."
        />
      ) : null}
    </div>
  );
}
