'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trash2, GripVertical, Loader2 } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import MediaUploader from '@/app/components/media/MediaUploader';
import BulkMediaUploader from '@/app/components/media/BulkMediaUploader';
import ImagePreview from '@/app/components/media/ImagePreview';
import ImagePicker from '@/app/components/media/ImagePicker';
import type { MediaDocument } from '@/lib/media-store';
import { readJsonResponse } from '@/lib/api-response';
import { clearSiteMediaCache } from '@/lib/media-service';

interface MediaManagerProps {
  initialMedia?: MediaDocument[];
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Image',
  about: 'About Section',
  gallery: 'Gallery',
  'gallery-homepage': 'Homepage Gallery',
  'gallery-full': 'Full Gallery',
  contact: 'Contact Section',
  'homepage-1': 'Homepage Image 1',
  'homepage-2': 'Homepage Image 2',
  'homepage-3': 'Homepage Image 3',
  'homepage-4': 'Homepage Image 4',
  'villa-hero': 'Villa Hero',
  'villa-about-1': 'Villa About Image 1',
  'villa-about-2': 'Villa About Image 2',
  'villa-activities': 'Villa Activities',
  'villa-location': 'Villa Location',
  'nearby-beach': 'Nearby Beach',
  'nearby-restaurants': 'Nearby Restaurants',
  'nearby-grocery': 'Nearby Grocery',
  'nearby-dock': 'Nearby Dock',
  'nearby-island': 'Nearby Island',
  'nearby-map': 'Nearby Map',
  logo: 'Logo',
};

const MEDIA_GROUPS: Record<string, string[]> = {
  logo: ['logo'],
  hero: ['hero'],
  contact: ['contact'],
  gallery: ['gallery-homepage', 'gallery-full'],
  villa: ['villa-hero', 'villa-about-1', 'villa-about-2', 'villa-activities', 'villa-location'],
  nearby: [
    'nearby-beach',
    'nearby-restaurants',
    'nearby-grocery',
    'nearby-dock',
    'nearby-island',
    'nearby-map',
  ],
};

const GROUP_LABELS: Record<string, string> = {
  logo: 'Branding',
  homepage: 'Homepage',
  contact: 'Contact',
  gallery: 'Gallery',
  villa: 'Villa',
  nearby: 'Nearby',
};

export default function MediaManager({ initialMedia = [] }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaDocument[]>(initialMedia);
  const [selectedGroup, setSelectedGroup] = useState('logo');
  const [selectedSection, setSelectedSection] = useState<string>(MEDIA_GROUPS.logo[0]);
  const [draft, setDraft] = useState<MediaDocument | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/media');
        if (!response.ok) {
          throw new Error('Unable to load media');
        }
        const payload = await readJsonResponse<unknown>(response, []);
        setMedia(Array.isArray(payload) ? (payload as MediaDocument[]) : []);
      } catch {
        setNotification({ type: 'error', message: 'Unable to load media from the database.' });
      } finally {
        setIsLoading(false);
      }
    };

    void loadMedia();
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }
    const timer = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const groupKeys = useMemo(() => MEDIA_GROUPS[selectedGroup] ?? [], [selectedGroup]);
  const homepageItems = useMemo(
    () =>
      [...media.filter((item) => item.section === 'gallery' && item.type === 'homepage')].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    [media]
  );
  const galleryItems = useMemo(
    () =>
      [...media.filter((item) => item.section === 'gallery' && item.type === 'full')].sort(
        (a, b) => a.order - b.order
      ),
    [media]
  );

  const groupItems = useMemo(() => {
    if (selectedGroup === 'gallery') {
      return media.filter((item) => item.section === 'gallery');
    }
    return media.filter((item) => groupKeys.includes(item.section));
  }, [media, groupKeys, selectedGroup]);

  const sectionItems = useMemo(() => {
    if (selectedGroup === 'gallery') {
      if (selectedSection === 'gallery-homepage') {
        return homepageItems;
      }
      if (selectedSection === 'gallery-full') {
        return galleryItems;
      }
      return galleryItems;
    }
    return groupItems.filter((item) => item.section === selectedSection);
  }, [groupItems, selectedSection, selectedGroup, homepageItems, galleryItems]);

  useEffect(() => {
    if (!groupKeys.includes(selectedSection)) {
      setSelectedSection(groupKeys[0]);
    }
  }, [groupKeys, selectedSection]);

  useEffect(() => {
    const current = sectionItems[0] || null;
    setDraft(current ? { ...current } : null);
  }, [sectionItems]);

  const handleUpload = async (file: File, dataUrl: string) => {
    if (selectedSection === 'gallery-full') {
      const nextItem = {
        section: 'gallery',
        type: 'full',
        key: `gallery-full-${Date.now()}`,
        alt: file.name,
        url: dataUrl,
        order: galleryItems.length + 1,
      };

      try {
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextItem),
        });
        const payload = await readJsonResponse<MediaDocument | { error?: string }>(
          response,
          {} as MediaDocument
        );
        if (!response.ok || 'error' in payload) {
          throw new Error((payload as { error?: string }).error || 'Unable to save gallery image.');
        }

        setMedia((current) => [...current, payload as MediaDocument]);
        clearSiteMediaCache();
        setNotification({ type: 'success', message: 'Gallery image added successfully.' });
      } catch (error) {
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unable to save gallery image.',
        });
      }
      return;
    }

    setDraft((current) => {
      const baseDraft: MediaDocument = current
        ? { ...current }
        : {
            id: `${selectedSection}-${Date.now()}`,
            section: selectedSection,
            key: `${selectedSection}-item`,
            alt: file.name,
            url: dataUrl,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      return {
        ...baseDraft,
        url: dataUrl,
        alt: file.name,
      };
    });
    setNotification({ type: 'success', message: 'Image preview updated. Save to persist it.' });
  };

  const handleBulkUpload = async (files: File[], dataUrls: string[]) => {
    if (selectedSection !== 'gallery-full') {
      return;
    }

    const items = files.map((file, index) => ({
      section: 'gallery',
      type: 'full',
      key: `gallery-full-${Date.now()}-${index}`,
      alt: file.name,
      url: dataUrls[index],
      order: galleryItems.length + index + 1,
    }));

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const payload = await readJsonResponse<MediaDocument[] | MediaDocument | { error?: string }>(
        response,
        [] as MediaDocument[]
      );

      if (!response.ok || ('error' in payload && !Array.isArray(payload))) {
        throw new Error((payload as { error?: string }).error || 'Unable to save gallery images.');
      }

      const createdItems = Array.isArray(payload) ? payload : [payload as MediaDocument];

      setMedia((current) => [...current, ...createdItems]);
      clearSiteMediaCache();
      setNotification({
        type: 'success',
        message: `${createdItems.length} gallery image${createdItems.length === 1 ? '' : 's'} added successfully.`,
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save gallery images.',
      });
    }
  };

  const handleHomepageUpload = async (position: number, file: File, dataUrl: string) => {
    const existingItem = homepageItems.find((item) => item.position === position);
    const payload = {
      section: 'gallery',
      type: 'homepage',
      key: existingItem?.key || `gallery-homepage-${position}`,
      alt: file.name,
      url: dataUrl,
      order: position,
      position,
      id: existingItem?.id,
      createdAt: existingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as MediaDocument;

    try {
      const response = await fetch('/api/admin/media', {
        method: existingItem ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readJsonResponse<MediaDocument | { error?: string }>(
        response,
        {} as MediaDocument
      );

      if (!response.ok || 'error' in responsePayload) {
        throw new Error(
          (responsePayload as { error?: string }).error || 'Unable to save homepage gallery image.'
        );
      }

      const savedItem = responsePayload as MediaDocument;
      clearSiteMediaCache();
      setMedia((current) => [...current.filter((item) => item.id !== savedItem.id), savedItem]);
      setNotification({ type: 'success', message: 'Homepage gallery image saved successfully.' });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save homepage gallery image.',
      });
    }
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    try {
      const existingSectionItem = sectionItems.length === 1 ? sectionItems[0] : null;
      const requestPayload = {
        ...draft,
        id: existingSectionItem?.id || draft.id,
        section: selectedSection,
        key: draft.key || `${selectedSection}-item`,
        order: draft.order ?? 0,
      };
      delete (requestPayload as Record<string, unknown>)._id;

      const shouldUpdateExisting = Boolean(
        requestPayload.id && media.some((item) => item.id === requestPayload.id)
      );
      const response = await fetch('/api/admin/media', {
        method: shouldUpdateExisting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      const responsePayload = await readJsonResponse<MediaDocument | { error?: string }>(
        response,
        {} as MediaDocument
      );
      if (!response.ok) {
        throw new Error((responsePayload as { error?: string }).error || 'Unable to save media.');
      }
      if (!('error' in responsePayload) && responsePayload && typeof responsePayload === 'object') {
        const savedItem = responsePayload as MediaDocument;
        clearSiteMediaCache();
        setNotification({ type: 'success', message: 'Image saved successfully.' });
        setMedia((current) => {
          const filtered = current.filter((item) => item.id !== savedItem.id);
          return [...filtered, savedItem];
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save media.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      return;
    }
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Unable to delete media.');
      }
      setNotification({ type: 'success', message: 'Image removed.' });
      setMedia((current) => current.filter((item) => item.id !== id));
      setDraft(null);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to delete media.',
      });
    }
  };

  const handleGalleryMove = async (fromIndex: number, toIndex: number) => {
    const nextItems = [...galleryItems];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    const reordered = nextItems.map((item, index) => ({ ...item, order: index + 1 }));
    setMedia((current) =>
      current
        .filter((item) => !(item.section === 'gallery' && item.type === 'full'))
        .concat(reordered)
    );
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: moved.id,
          section: 'gallery',
          type: 'full',
          order: toIndex + 1,
        }),
      });
      if (!response.ok) {
        throw new Error('Unable to reorder gallery images.');
      }
      setNotification({ type: 'success', message: 'Gallery order updated.' });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to reorder gallery images.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {notification ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-3 text-sm ${notification.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}
        >
          {notification.message}
        </motion.div>
      ) : null}

      <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_25px_80px_rgba(27,79,107,0.08)]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-caps text-primary">Media Library</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Manage dynamic website images
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload, replace, delete, and reorder visuals without touching the code.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {isLoading ? 'Loading media...' : `${media.length} media entries available`}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(GROUP_LABELS).map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`rounded-full px-4 py-2 text-sm ${selectedGroup === group ? 'bg-primary text-white' : 'bg-muted/60 text-foreground'}`}
            >
              {GROUP_LABELS[group] || group}
            </button>
          ))}
        </div>
        {groupKeys.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {groupKeys.map((sectionKey) => (
              <button
                key={sectionKey}
                type="button"
                onClick={() => setSelectedSection(sectionKey)}
                className={`rounded-full px-4 py-2 text-sm ${selectedSection === sectionKey ? 'bg-foreground text-white' : 'bg-muted/40 text-foreground'}`}
              >
                {SECTION_LABELS[sectionKey] || sectionKey}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_25px_80px_rgba(27,79,107,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="label-caps text-primary">
                {SECTION_LABELS[selectedSection] || selectedSection}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Image settings</h3>
            </div>
            <div className="rounded-full bg-muted/60 px-3 py-1 text-sm text-muted-foreground">
              {selectedSection === 'gallery-full' ? 'Multi-image support' : 'Single image'}
            </div>
          </div>

          {selectedSection === 'gallery-full' ? (
            <div className="space-y-4">
              <BulkMediaUploader
                onSelect={handleBulkUpload}
                label="Upload multiple gallery images"
                maxFiles={20}
              />
              <MediaUploader onSelect={handleUpload} label="Add gallery image" compact />
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggedId) {
                      return;
                    }
                    const fromIndex = galleryItems.findIndex((entry) => entry.id === draggedId);
                    const toIndex = index;
                    if (fromIndex >= 0 && fromIndex !== toIndex) {
                      void handleGalleryMove(fromIndex, toIndex);
                    }
                    setDraggedId(null);
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="relative h-20 w-24 overflow-hidden rounded-xl border border-border">
                    <img
                      src={item.url}
                      alt={item.alt || 'Gallery image'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.alt || 'Gallery image'}
                    </p>
                    <p className="text-xs text-muted-foreground">Position {index + 1}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-rose-200 p-2 text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : selectedSection === 'gallery-homepage' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((position) => {
                const item = homepageItems.find((entry) => entry.position === position);
                return (
                  <div key={position} className="rounded-3xl border border-border bg-muted/30 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Position {position}</p>
                      {item ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-full border border-rose-200 p-2 text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-white/60">
                      {item ? (
                        <AppImage
                          src={item.url}
                          alt={item.alt || `Homepage gallery position ${position}`}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center px-4 text-sm text-muted-foreground">
                          No image assigned for position {position}.
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <MediaUploader
                        onSelect={(file, dataUrl) => handleHomepageUpload(position, file, dataUrl)}
                        label={item ? 'Replace image' : 'Upload image'}
                        compact
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5">
              <ImagePicker
                value={draft?.url}
                onChange={(value) =>
                  setDraft((current) => (current ? { ...current, url: value } : null))
                }
                onRemove={() => setDraft((current) => (current ? { ...current, url: '' } : null))}
                alt={draft?.alt || 'Media preview'}
                label="Current Image"
              />
              <MediaUploader onSelect={handleUpload} label="Upload image" />
              <ImagePreview
                src={draft?.url}
                alt={draft?.alt || 'Preview'}
                label="Preview before saving"
              />
              <label className="grid gap-2 text-sm text-muted-foreground">
                Alt text
                <input
                  value={draft?.alt || ''}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, alt: event.target.value } : null
                    )
                  }
                  className="rounded-2xl border border-border px-4 py-3 text-foreground"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !draft?.url}
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save image'}
                </button>
                {draft?.id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(draft.id)}
                    className="flex items-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete image
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_25px_80px_rgba(27,79,107,0.08)]">
          <div className="mb-6">
            <p className="label-caps text-primary">How it works</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">Modern media management</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Upload & preview</p>
              <p className="mt-1">
                Accepts JPG, PNG, and WEBP files up to 4MB with instant preview before you save.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Dynamic frontend</p>
              <p className="mt-1">
                The website reads these records at runtime, so changing an image updates the public
                site.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Gallery ordering</p>
              <p className="mt-1">
                Drag and drop is supported in the admin panel and the frontend follows the saved
                order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
