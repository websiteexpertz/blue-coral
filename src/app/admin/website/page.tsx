'use client';

import { useEffect, useMemo, useState } from 'react';
import MediaUploader from '@/app/components/media/MediaUploader';
import { clearSiteMediaCache } from '@/lib/media-service';
import { Save, Trash2, GripVertical, Loader2 } from 'lucide-react';
import PageHeader from '@/app/components/admin/PageHeader';
import {
  DEFAULT_SITE_CONTENT,
  normalizeSiteContent,
  type SiteContentData,
} from '@/lib/site-content-types';
import { clearSiteContentCache } from '@/lib/site-content-service';
import { findCircularPaths } from '@/lib/detect-circular';
import type { MediaDocument } from '@/lib/media-store';
import BulkMediaUploader from '@/app/components/media/BulkMediaUploader';
import AppImage from '@/components/ui/AppImage';

const emptyHighlight = { title: '', description: '' };
const emptyCard = { title: '', description: '', tag: '', key: '', src: '', alt: '' };

export default function AdminWebsitePage() {
  const [content, setContent] = useState<SiteContentData>(DEFAULT_SITE_CONTENT);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [galleryMedia, setGalleryMedia] = useState<MediaDocument[]>([]);
  const [homepageGallery, setHomepageGallery] = useState<MediaDocument[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  useEffect(() => {
    void fetch('/api/admin/content')
      .then((response) => response.json())
      .then((data) => {
        if (data && typeof data === 'object' && !('error' in data)) {
          setContent(normalizeSiteContent(data as Partial<SiteContentData>));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const loadGalleryMedia = async () => {
      setLoadingGallery(true);
      try {
        const response = await fetch('/api/admin/media');
        const media = await response.json();
        const galleryItems = Array.isArray(media)
          ? media.filter(
              (item: MediaDocument) => item.section === 'gallery' && item.type === 'full'
            )
          : [];
        const homepageItems = Array.isArray(media)
          ? media.filter(
              (item: MediaDocument) => item.section === 'gallery' && item.type === 'homepage'
            )
          : [];
        setGalleryMedia(
          galleryItems.sort((a: MediaDocument, b: MediaDocument) => (a.order ?? 0) - (b.order ?? 0))
        );
        setHomepageGallery(
          homepageItems.sort(
            (a: MediaDocument, b: MediaDocument) => (a.position ?? 0) - (b.position ?? 0)
          )
        );
      } catch {
        // ignore
      } finally {
        setLoadingGallery(false);
      }
    };
    void loadGalleryMedia();
  }, []);

  const updateHero = (patch: Partial<SiteContentData['hero']>) => {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, ...patch },
    }));
  };

  const updateAbout = (patch: Partial<SiteContentData['about']>) => {
    setContent((current) => ({
      ...current,
      about: { ...current.about, ...patch },
    }));
  };

  const updateVillaFeatures = (patch: Partial<SiteContentData['villaFeatures']>) => {
    setContent((current) => ({
      ...current,
      villaFeatures: { ...current.villaFeatures, ...patch },
    }));
  };

  const updateLocation = (patch: Partial<SiteContentData['location']>) => {
    setContent((current) => ({
      ...current,
      location: { ...current.location, ...patch },
    }));
  };

  const updateAmenities = (patch: Partial<SiteContentData['amenities']>) => {
    setContent((current) => ({
      ...current,
      amenities: { ...current.amenities, ...patch },
    }));
  };

  const updateRooms = (patch: Partial<SiteContentData['rooms']>) => {
    setContent((current) => ({
      ...current,
      rooms: { ...current.rooms, ...patch },
    }));
  };

  const updateNearbyAttractions = (patch: Partial<SiteContentData['nearbyAttractions']>) => {
    setContent((current) => ({
      ...current,
      nearbyAttractions: { ...current.nearbyAttractions, ...patch },
    }));
  };

  const updateThingsToDo = (patch: Partial<SiteContentData['thingsToDo']>) => {
    setContent((current) => ({
      ...current,
      thingsToDo: { ...current.thingsToDo, ...patch },
    }));
  };

  const updateHouseRules = (patch: Partial<SiteContentData['houseRules']>) => {
    setContent((current) => ({
      ...current,
      houseRules: { ...current.houseRules, ...patch },
    }));
  };

  const updateImportantInformation = (patch: Partial<SiteContentData['importantInformation']>) => {
    setContent((current) => ({
      ...current,
      importantInformation: { ...current.importantInformation, ...patch },
    }));
  };

  const updateNeighborhood = (patch: Partial<SiteContentData['neighborhood']>) => {
    setContent((current) => ({
      ...current,
      neighborhood: { ...current.neighborhood, ...patch },
    }));
  };

  const updateFaq = (patch: Partial<SiteContentData['faq']>) => {
    setContent((current) => ({
      ...current,
      faq: { ...current.faq, ...patch },
    }));
  };

  const updateGuestReviews = (patch: Partial<SiteContentData['guestReviews']>) => {
    setContent((current) => ({
      ...current,
      guestReviews: { ...current.guestReviews, ...patch },
    }));
  };

  const updateContact = (patch: Partial<SiteContentData['contact']>) => {
    setContent((current) => ({
      ...current,
      contact: { ...current.contact, ...patch },
    }));
  };

  const updateFooter = (patch: Partial<SiteContentData['footer']>) => {
    setContent((current) => ({
      ...current,
      footer: { ...current.footer, ...patch },
    }));
  };

  const uploadGalleryImages = async (files: File[], dataUrls: string[]) => {
    setSavingGallery(true);
    try {
      const items = files.map((file, index) => ({
        section: 'gallery',
        type: 'full',
        key: `gallery-full-${Date.now()}-${index}`,
        alt: file.name,
        url: dataUrls[index],
        order: (galleryMedia.length + index) * 10,
      }));

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      if (response.ok) {
        const created = await response.json();
        const newItems = Array.isArray(created) ? created : [created];
        setGalleryMedia((current) =>
          [...current, ...newItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
        clearSiteMediaCache();
      }
    } catch {
      // ignore
    } finally {
      setSavingGallery(false);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setGalleryMedia((current) => current.filter((item) => item.id !== id));
        clearSiteMediaCache();
      }
    } catch {
      // ignore
    }
  };

  const reorderGalleryImages = async (newOrder: MediaDocument[]) => {
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order: index * 10,
      }));

      for (const update of updates) {
        await fetch('/api/admin/media', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
      }

      setGalleryMedia(newOrder);
      clearSiteMediaCache();
    } catch {
      // ignore
    }
  };

  const uploadHomepageGalleryImage = async (position: number, file: File, dataUrl: string) => {
    const existingItem = homepageGallery.find((item) => item.position === position);
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

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unable to save homepage image.' }));
        throw new Error(error?.error || 'Unable to save homepage image.');
      }

      const saved = (await response.json()) as MediaDocument;
      setHomepageGallery((current) => {
        const next = current.filter((item) => item.position !== position);
        return [...next, saved].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      });
      clearSiteMediaCache();
      setMessage('Homepage gallery image saved successfully.');
      window.setTimeout(() => setMessage(''), 3200);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unable to save homepage image.';
      setMessage(messageText);
      window.setTimeout(() => setMessage(''), 3200);
    }
  };

  const saveContent = async (payload?: SiteContentData) => {
    setSaving(true);
    setMessage('');
    try {
      const body = normalizeSiteContent(payload ?? content);
      try {
        // quick attempt to reveal circular references with a descriptive log
        JSON.stringify(body);
      } catch (err) {
        const paths = findCircularPaths(body);
        // eslint-disable-next-line no-console
        console.error(
          'Circular reference detected while stringifying website content:',
          paths,
          err
        );
        throw new Error(
          `Unable to serialize website content for saving. Circular references found: ${paths.join(', ')}`
        );
      }

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.redirected || response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        throw new Error('Your admin session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || 'Unable to save content');
      }

      clearSiteContentCache();
      setMessage('Website content saved successfully.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('admin session')) {
        setMessage(error.message);
        return;
      }

      setMessage(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to save right now. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const [selectedSection, setSelectedSection] = useState<
    | 'hero'
    | 'about'
    | 'villaFeatures'
    | 'gallery'
    | 'amenities'
    | 'rooms'
    | 'nearbyAttractions'
    | 'thingsToDo'
    | 'houseRules'
    | 'importantInformation'
    | 'neighborhood'
    | 'faq'
    | 'guestReviews'
    | 'contact'
    | 'footer'
  >('hero');

  const SECTION_TABS = [
    { key: 'hero', label: 'Hero' },
    { key: 'about', label: 'About' },
    { key: 'villaFeatures', label: 'Villa Features' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'amenities', label: 'Amenities' },
    { key: 'rooms', label: 'Rooms' },
    { key: 'nearbyAttractions', label: 'Nearby Attractions' },
    { key: 'thingsToDo', label: 'Things To Do' },
    { key: 'houseRules', label: 'House Rules' },
    { key: 'importantInformation', label: 'Important Info' },
    { key: 'neighborhood', label: 'Neighborhood' },
    { key: 'faq', label: 'FAQ' },
    { key: 'guestReviews', label: 'Guest Reviews' },
    { key: 'contact', label: 'Contact' },
    { key: 'footer', label: 'Footer' },
  ] as const;

  const statsFields = useMemo(() => content.hero.stats, [content.hero.stats]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Website content"
        description="Update the villa hero, about section, amenities, rooms, nearby attractions, house rules, neighborhood, guest reviews, and contact content that appears on the public website."
        actions={
          <button
            type="button"
            onClick={() => void saveContent()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save content'}
          </button>
        }
      />

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_25px_80px_rgba(27,79,107,0.08)]">
        <div className="flex flex-wrap gap-2">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedSection(tab.key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedSection === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-muted/40 text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedSection === 'hero' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Hero section</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.hero.eyebrow}
                onChange={(event) => updateHero({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.hero.title}
                onChange={(event) => updateHero({ title: event.target.value })}
                className="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Subtitle
              <textarea
                value={content.hero.subtitle}
                onChange={(event) => updateHero({ subtitle: event.target.value })}
                className="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Primary CTA
                <input
                  value={content.hero.ctaPrimary}
                  onChange={(event) => updateHero({ ctaPrimary: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm text-slate-600">
                Secondary CTA
                <input
                  value={content.hero.ctaSecondary}
                  onChange={(event) => updateHero({ ctaSecondary: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-600">
              Hero image key
              <div className="mt-1 flex items-center gap-3">
                <input
                  value={content.hero.imageKey}
                  onChange={(event) => updateHero({ imageKey: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                <MediaUploader
                  onSelect={async (file, dataUrl) => {
                    try {
                      const payload = {
                        section: 'hero',
                        key: content.hero.imageKey || `hero-${Date.now()}`,
                        alt: file.name,
                        url: dataUrl,
                      };
                      const res = await fetch('/api/admin/media', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      const created = await res.json();
                      if (res.ok) {
                        const next = {
                          ...content,
                          hero: { ...content.hero, imageKey: created.key, imageSrc: created.url },
                        } as SiteContentData;
                        setContent(next);
                        setPreviews((p) => ({ ...p, [created.key]: created.url }));
                        clearSiteMediaCache();
                        try {
                          await saveContent(next);
                          setMessage('Image uploaded and content saved.');
                        } catch {
                          setMessage('Image uploaded but saving content failed.');
                        }
                        window.setTimeout(() => setMessage(''), 3200);
                      } else {
                        setMessage(created?.error || 'Unable to upload image.');
                        window.setTimeout(() => setMessage(''), 3200);
                      }
                    } catch (err) {
                      // ignore - MediaUploader shows errors
                    }
                  }}
                />
                {previews[content.hero.imageKey] ? (
                  <div className="ml-2">
                    <img
                      src={previews[content.hero.imageKey]}
                      alt="preview"
                      className="w-24 h-14 rounded-md object-cover border"
                    />
                  </div>
                ) : null}
              </div>
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Hero stats</p>
              {statsFields.map((item, index) => (
                <div key={`${item.label}-${index}`} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={item.value}
                    onChange={(event) => {
                      const nextStats = [...content.hero.stats];
                      nextStats[index] = { ...nextStats[index], value: event.target.value };
                      updateHero({ stats: nextStats });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Value"
                  />
                  <input
                    value={item.label}
                    onChange={(event) => {
                      const nextStats = [...content.hero.stats];
                      nextStats[index] = { ...nextStats[index], label: event.target.value };
                      updateHero({ stats: nextStats });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Label"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'about' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">About section</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.about.eyebrow}
                onChange={(event) => updateAbout({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.about.title}
                onChange={(event) => updateAbout({ title: event.target.value })}
                className="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Body text
              <textarea
                value={content.about.text}
                onChange={(event) => updateAbout({ text: event.target.value })}
                className="mt-1 min-h-[140px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Image key 1
                <div className="mt-1 flex items-center gap-3">
                  <input
                    value={content.about.imageKey1}
                    onChange={(event) => updateAbout({ imageKey1: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                  <MediaUploader
                    onSelect={async (file, dataUrl) => {
                      try {
                        const payload = {
                          section: 'about',
                          key: content.about.imageKey1 || `about-1-${Date.now()}`,
                          alt: file.name,
                          url: dataUrl,
                        };
                        const res = await fetch('/api/admin/media', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        const created = await res.json();
                        if (res.ok) {
                          const next = {
                            ...content,
                            about: {
                              ...content.about,
                              imageKey1: created.key,
                              imageSrc1: created.url,
                            },
                          } as SiteContentData;
                          setContent(next);
                          setPreviews((p) => ({ ...p, [created.key]: created.url }));
                          clearSiteMediaCache();
                          try {
                            await saveContent(next);
                            setMessage('Image uploaded and content saved.');
                          } catch {
                            setMessage('Image uploaded but saving content failed.');
                          }
                          window.setTimeout(() => setMessage(''), 3200);
                        } else {
                          setMessage(created?.error || 'Unable to upload image.');
                          window.setTimeout(() => setMessage(''), 3200);
                        }
                      } catch (err) {
                        // ignore
                      }
                    }}
                  />
                  {previews[content.about.imageKey1] ? (
                    <div className="ml-2">
                      <img
                        src={previews[content.about.imageKey1]}
                        alt="preview"
                        className="w-24 h-14 rounded-md object-cover border"
                      />
                    </div>
                  ) : null}
                </div>
              </label>
              <label className="block text-sm text-slate-600">
                Image key 2
                <div className="mt-1 flex items-center gap-3">
                  <input
                    value={content.about.imageKey2}
                    onChange={(event) => updateAbout({ imageKey2: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                  <MediaUploader
                    onSelect={async (file, dataUrl) => {
                      try {
                        const payload = {
                          section: 'about',
                          key: content.about.imageKey2 || `about-2-${Date.now()}`,
                          alt: file.name,
                          url: dataUrl,
                        };
                        const res = await fetch('/api/admin/media', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        const created = await res.json();
                        if (res.ok) {
                          const next = {
                            ...content,
                            about: {
                              ...content.about,
                              imageKey2: created.key,
                              imageSrc2: created.url,
                            },
                          } as SiteContentData;
                          setContent(next);
                          setPreviews((p) => ({ ...p, [created.key]: created.url }));
                          clearSiteMediaCache();
                          try {
                            await saveContent(next);
                            setMessage('Image uploaded and content saved.');
                          } catch {
                            setMessage('Image uploaded but saving content failed.');
                          }
                          window.setTimeout(() => setMessage(''), 3200);
                        } else {
                          setMessage(created?.error || 'Unable to upload image.');
                          window.setTimeout(() => setMessage(''), 3200);
                        }
                      } catch (err) {
                        // ignore
                      }
                    }}
                  />
                  {previews[content.about.imageKey2] ? (
                    <div className="ml-2">
                      <img
                        src={previews[content.about.imageKey2]}
                        alt="preview"
                        className="w-24 h-14 rounded-md object-cover border"
                      />
                    </div>
                  ) : null}
                </div>
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">About highlights</p>
              {content.about.highlights.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={item.title}
                    onChange={(event) => {
                      const nextHighlights = [...content.about.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        title: event.target.value,
                      };
                      updateAbout({ highlights: nextHighlights });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Title"
                  />
                  <textarea
                    value={item.description}
                    onChange={(event) => {
                      const nextHighlights = [...content.about.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        description: event.target.value,
                      };
                      updateAbout({ highlights: nextHighlights });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'villaFeatures' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Villa Features</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.villaFeatures.eyebrow}
                onChange={(event) => updateVillaFeatures({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.villaFeatures.title}
                onChange={(event) => updateVillaFeatures({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Description
              <textarea
                value={content.villaFeatures.description}
                onChange={(event) => updateVillaFeatures({ description: event.target.value })}
                className="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Feature cards</p>
              {content.villaFeatures.highlights.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={item.title}
                    onChange={(event) => {
                      const nextHighlights = [...content.villaFeatures.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        title: event.target.value,
                      };
                      updateVillaFeatures({ highlights: nextHighlights });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Title"
                  />
                  <textarea
                    value={item.description}
                    onChange={(event) => {
                      const nextHighlights = [...content.villaFeatures.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        description: event.target.value,
                      };
                      updateVillaFeatures({ highlights: nextHighlights });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Footer amenities</p>
              {content.villaFeatures.footerItems.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextItems = [...content.villaFeatures.footerItems];
                    nextItems[index] = event.target.value;
                    updateVillaFeatures({ footerItems: nextItems });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'gallery' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Gallery Images</h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload and manage the gallery images displayed on the full gallery page and homepage
                gallery section.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-base font-semibold text-slate-900">Homepage gallery</h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((position) => {
                  const item = homepageGallery.find((entry) => entry.position === position);
                  return (
                    <div key={position} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">Position {position}</p>
                        {item ? (
                          <button
                            type="button"
                            onClick={() => deleteGalleryImage(item.id)}
                            className="rounded-full border border-rose-200 p-2 text-rose-600"
                            title="Remove homepage image"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                      <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {item ? (
                          <AppImage
                            src={item.url}
                            alt={item.alt || `Homepage gallery position ${position}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-slate-500">
                            No image assigned for this slot.
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <MediaUploader
                          onSelect={async (file, dataUrl) => {
                            await uploadHomepageGalleryImage(position, file, dataUrl);
                          }}
                          label={item ? 'Replace image' : 'Upload image'}
                          compact
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <BulkMediaUploader
                onSelect={uploadGalleryImages}
                disabled={savingGallery}
                label="Upload gallery images"
                maxFiles={50}
              />
            </div>

            {loadingGallery ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="text-slate-600 animate-spin" />
              </div>
            ) : galleryMedia.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {galleryMedia.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50"
                  >
                    <GripVertical size={18} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                      <AppImage
                        src={item.url}
                        alt={item.alt}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.alt}</p>
                      <p className="text-xs text-slate-500">Order: {item.order ?? 0}</p>
                    </div>
                    <button
                      onClick={() => deleteGalleryImage(item.id)}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500">No gallery images uploaded yet</p>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedSection === 'amenities' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.amenities.eyebrow}
                onChange={(event) => updateAmenities({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.amenities.title}
                onChange={(event) => updateAmenities({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.amenities.text}
                onChange={(event) => updateAmenities({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Highlights</p>
              {content.amenities.highlights.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={item.title}
                    onChange={(event) => {
                      const nextHighlights = [...content.amenities.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        title: event.target.value,
                      };
                      updateAmenities({ highlights: nextHighlights });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Title"
                  />
                  <textarea
                    value={item.body}
                    onChange={(event) => {
                      const nextHighlights = [...content.amenities.highlights];
                      nextHighlights[index] = {
                        ...nextHighlights[index],
                        body: event.target.value,
                      };
                      updateAmenities({ highlights: nextHighlights });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Body"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Amenity categories</p>
              {content.amenities.categories.map((category, index) => (
                <div
                  key={`${category.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={category.title}
                    onChange={(event) => {
                      const nextCategories = [...content.amenities.categories];
                      nextCategories[index] = {
                        ...nextCategories[index],
                        title: event.target.value,
                      };
                      updateAmenities({ categories: nextCategories });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Category title"
                  />
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <input
                        key={`${item}-${itemIndex}`}
                        value={item}
                        onChange={(event) => {
                          const nextCategories = [...content.amenities.categories];
                          const nextItems = [...nextCategories[index].items];
                          nextItems[itemIndex] = event.target.value;
                          nextCategories[index] = { ...nextCategories[index], items: nextItems };
                          updateAmenities({ categories: nextCategories });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2"
                        placeholder="Amenity item"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'rooms' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Rooms & Spaces</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.rooms.eyebrow}
                onChange={(event) => updateRooms({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.rooms.title}
                onChange={(event) => updateRooms({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.rooms.text}
                onChange={(event) => updateRooms({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Bedrooms</p>
              {content.rooms.bedrooms.map((bedroom, index) => (
                <div
                  key={`${bedroom.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={bedroom.title}
                    onChange={(event) => {
                      const nextBedrooms = [...content.rooms.bedrooms];
                      nextBedrooms[index] = { ...nextBedrooms[index], title: event.target.value };
                      updateRooms({ bedrooms: nextBedrooms });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Bedroom title"
                  />
                  <textarea
                    value={bedroom.details}
                    onChange={(event) => {
                      const nextBedrooms = [...content.rooms.bedrooms];
                      nextBedrooms[index] = { ...nextBedrooms[index], details: event.target.value };
                      updateRooms({ bedrooms: nextBedrooms });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Bedroom details"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Bathrooms</p>
              {content.rooms.bathrooms.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextBathrooms = [...content.rooms.bathrooms];
                    nextBathrooms[index] = event.target.value;
                    updateRooms({ bathrooms: nextBathrooms });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Bathroom details"
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Spaces</p>
              {content.rooms.spaces.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextSpaces = [...content.rooms.spaces];
                    nextSpaces[index] = event.target.value;
                    updateRooms({ spaces: nextSpaces });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Space description"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'nearbyAttractions' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Nearby Attractions</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.nearbyAttractions.eyebrow}
                onChange={(event) => updateNearbyAttractions({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.nearbyAttractions.title}
                onChange={(event) => updateNearbyAttractions({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.nearbyAttractions.text}
                onChange={(event) => updateNearbyAttractions({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Pills</p>
              {content.nearbyAttractions.pills.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextPills = [...content.nearbyAttractions.pills];
                    nextPills[index] = event.target.value;
                    updateNearbyAttractions({ pills: nextPills });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Pill text"
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Attractions</p>
              {content.nearbyAttractions.attractions.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <input
                    value={item.name}
                    onChange={(event) => {
                      const nextAttractions = [...content.nearbyAttractions.attractions];
                      nextAttractions[index] = {
                        ...nextAttractions[index],
                        name: event.target.value,
                      };
                      updateNearbyAttractions({ attractions: nextAttractions });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Attraction name"
                  />
                  <textarea
                    value={item.description}
                    onChange={(event) => {
                      const nextAttractions = [...content.nearbyAttractions.attractions];
                      nextAttractions[index] = {
                        ...nextAttractions[index],
                        description: event.target.value,
                      };
                      updateNearbyAttractions({ attractions: nextAttractions });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Description"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Restaurants</p>
              {content.nearbyAttractions.restaurants.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextRestaurants = [...content.nearbyAttractions.restaurants];
                    nextRestaurants[index] = event.target.value;
                    updateNearbyAttractions({ restaurants: nextRestaurants });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Restaurant name and distance"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'thingsToDo' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Things To Do</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.thingsToDo.eyebrow}
                onChange={(event) => updateThingsToDo({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.thingsToDo.title}
                onChange={(event) => updateThingsToDo({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.thingsToDo.text}
                onChange={(event) => updateThingsToDo({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Activities</p>
              {content.thingsToDo.activities.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextActivities = [...content.thingsToDo.activities];
                    nextActivities[index] = event.target.value;
                    updateThingsToDo({ activities: nextActivities });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Activity"
                />
              ))}
            </div>
            <label className="block text-sm text-slate-600">
              Image key
              <div className="mt-1 flex items-center gap-3">
                <input
                  value={content.thingsToDo.imageKey}
                  onChange={(event) => updateThingsToDo({ imageKey: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                <MediaUploader
                  onSelect={async (file, dataUrl) => {
                    try {
                      const payload = {
                        section: content.thingsToDo.imageKey || `thingsToDo-${Date.now()}`,
                        key: content.thingsToDo.imageKey || `thingsToDo-${Date.now()}`,
                        alt: file.name,
                        url: dataUrl,
                      };
                      const res = await fetch('/api/admin/media', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      const created = await res.json();
                      if (res.ok) {
                        const next = {
                          ...content,
                          thingsToDo: {
                            ...content.thingsToDo,
                            imageKey: created.key,
                            imageSrc: created.url,
                          },
                        } as SiteContentData;
                        setContent(next);
                        setPreviews((p) => ({ ...p, [created.key]: created.url }));
                        clearSiteMediaCache();
                        try {
                          await saveContent(next);
                          setMessage('Image uploaded and content saved.');
                        } catch {
                          setMessage('Image uploaded but saving content failed.');
                        }
                        window.setTimeout(() => setMessage(''), 3200);
                      } else {
                        setMessage(created?.error || 'Unable to upload image.');
                        window.setTimeout(() => setMessage(''), 3200);
                      }
                    } catch (err) {
                      // ignore
                    }
                  }}
                />
                {previews[content.thingsToDo.imageKey] ? (
                  <div className="ml-2">
                    <img
                      src={previews[content.thingsToDo.imageKey]}
                      alt="preview"
                      className="w-24 h-14 rounded-md object-cover border"
                    />
                  </div>
                ) : null}
              </div>
            </label>
          </div>
        </section>
      )}

      {selectedSection === 'houseRules' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">House Rules</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.houseRules.eyebrow}
                onChange={(event) => updateHouseRules({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.houseRules.title}
                onChange={(event) => updateHouseRules({ title: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Rules</p>
              {content.houseRules.rules.map((rule, index) => (
                <div key={`${rule.label}-${index}`} className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={rule.label}
                    onChange={(event) => {
                      const nextRules = [...content.houseRules.rules];
                      nextRules[index] = { ...nextRules[index], label: event.target.value };
                      updateHouseRules({ rules: nextRules });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Label"
                  />
                  <input
                    value={rule.value}
                    onChange={(event) => {
                      const nextRules = [...content.houseRules.rules];
                      nextRules[index] = { ...nextRules[index], value: event.target.value };
                      updateHouseRules({ rules: nextRules });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'importantInformation' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Important information</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.importantInformation.eyebrow}
                onChange={(event) => updateImportantInformation({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.importantInformation.title}
                onChange={(event) => updateImportantInformation({ title: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Notes</p>
              {content.importantInformation.notes.map((note, index) => (
                <input
                  key={`${note}-${index}`}
                  value={note}
                  onChange={(event) => {
                    const nextNotes = [...content.importantInformation.notes];
                    nextNotes[index] = event.target.value;
                    updateImportantInformation({ notes: nextNotes });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Important note"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'neighborhood' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">About the neighborhood</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.neighborhood.eyebrow}
                onChange={(event) => updateNeighborhood({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.neighborhood.title}
                onChange={(event) => updateNeighborhood({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.neighborhood.text}
                onChange={(event) => updateNeighborhood({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Highlights</p>
              {content.neighborhood.highlights.map((item, index) => (
                <input
                  key={`${item}-${index}`}
                  value={item}
                  onChange={(event) => {
                    const nextHighlights = [...content.neighborhood.highlights];
                    nextHighlights[index] = event.target.value;
                    updateNeighborhood({ highlights: nextHighlights });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Neighborhood highlight"
                />
              ))}
            </div>
            <label className="block text-sm text-slate-600">
              Map link
              <input
                value={content.neighborhood.mapLink}
                onChange={(event) => updateNeighborhood({ mapLink: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
        </section>
      )}

      {selectedSection === 'faq' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">FAQ</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.faq.eyebrow}
                onChange={(event) => updateFaq({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.faq.title}
                onChange={(event) => updateFaq({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Intro text
              <textarea
                value={content.faq.text}
                onChange={(event) => updateFaq({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">FAQ items</p>
                <button
                  type="button"
                  onClick={() =>
                    updateFaq({
                      items: [...content.faq.items, { question: '', answer: '' }],
                    })
                  }
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Add FAQ item
                </button>
              </div>
              {content.faq.items.map((item, index) => (
                <div key={`faq-item-${index}`} className="rounded-2xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = content.faq.items.filter(
                          (_, faqIndex) => faqIndex !== index
                        );
                        updateFaq({ items: nextItems });
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                    >
                      Delete FAQ
                    </button>
                  </div>
                  <input
                    value={item.question}
                    onChange={(event) => {
                      const nextItems = [...content.faq.items];
                      nextItems[index] = { ...nextItems[index], question: event.target.value };
                      updateFaq({ items: nextItems });
                    }}
                    className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Question"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(event) => {
                      const nextItems = [...content.faq.items];
                      nextItems[index] = { ...nextItems[index], answer: event.target.value };
                      updateFaq({ items: nextItems });
                    }}
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Answer"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'guestReviews' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Guest Reviews</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.guestReviews.eyebrow}
                onChange={(event) => updateGuestReviews({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.guestReviews.title}
                onChange={(event) => updateGuestReviews({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.guestReviews.text}
                onChange={(event) => updateGuestReviews({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Reviews</p>
                <button
                  type="button"
                  onClick={() =>
                    updateGuestReviews({
                      reviews: [...content.guestReviews.reviews, { quote: '', author: '' }],
                    })
                  }
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Add review
                </button>
              </div>
              {content.guestReviews.reviews.map((review, index) => (
                <div
                  key={`guest-review-${index}`}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <div className="mb-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextReviews = content.guestReviews.reviews.filter(
                          (_, reviewIndex) => reviewIndex !== index
                        );
                        updateGuestReviews({ reviews: nextReviews });
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                    >
                      Delete review
                    </button>
                  </div>
                  <textarea
                    value={review.quote}
                    onChange={(event) => {
                      const nextReviews = [...content.guestReviews.reviews];
                      nextReviews[index] = { ...nextReviews[index], quote: event.target.value };
                      updateGuestReviews({ reviews: nextReviews });
                    }}
                    className="mb-2 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Quote"
                  />
                  <input
                    value={review.author}
                    onChange={(event) => {
                      const nextReviews = [...content.guestReviews.reviews];
                      nextReviews[index] = { ...nextReviews[index], author: event.target.value };
                      updateGuestReviews({ reviews: nextReviews });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Author"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedSection === 'contact' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Contact section</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-600">
              Eyebrow
              <input
                value={content.contact.eyebrow}
                onChange={(event) => updateContact({ eyebrow: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Title
              <textarea
                value={content.contact.title}
                onChange={(event) => updateContact({ title: event.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Text
              <textarea
                value={content.contact.text}
                onChange={(event) => updateContact({ text: event.target.value })}
                className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Email
              <input
                value={content.contact.email}
                onChange={(event) => updateContact({ email: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Phone
              <input
                value={content.contact.phone}
                onChange={(event) => updateContact({ phone: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm text-slate-600">
              Note
              <textarea
                value={content.contact.note}
                onChange={(event) => updateContact({ note: event.target.value })}
                className="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
        </section>
      )}

      {selectedSection === 'footer' && (
        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Footer</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Social Links</p>
              {content.footer.socialLinks.map((link, index) => (
                <div
                  key={`${link.platform}-${index}`}
                  className="rounded-2xl border border-slate-200 p-4 space-y-3"
                >
                  <label className="block text-sm text-slate-600">
                    Platform
                    <input
                      value={link.platform}
                      onChange={(event) => {
                        const nextLinks = [...content.footer.socialLinks];
                        nextLinks[index] = {
                          ...nextLinks[index],
                          platform: event.target.value,
                        };
                        updateFooter({ socialLinks: nextLinks });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      placeholder="e.g., Instagram, Facebook, Twitter"
                    />
                  </label>
                  <label className="block text-sm text-slate-600">
                    URL
                    <input
                      value={link.url}
                      onChange={(event) => {
                        const nextLinks = [...content.footer.socialLinks];
                        nextLinks[index] = {
                          ...nextLinks[index],
                          url: event.target.value,
                        };
                        updateFooter({ socialLinks: nextLinks });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      placeholder="https://..."
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextLinks = content.footer.socialLinks.filter((_, i) => i !== index);
                      updateFooter({ socialLinks: nextLinks });
                    }}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove link
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const nextLinks = [...content.footer.socialLinks, { platform: '', url: '' }];
                  updateFooter({ socialLinks: nextLinks });
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                + Add social link
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
