import type { MediaDocument } from '@/lib/media-store';
import { readJsonResponse } from '@/lib/api-response';

let mediaCache: MediaDocument[] | null = null;
let mediaPromise: Promise<MediaDocument[]> | null = null;

export function clearSiteMediaCache() {
  mediaCache = null;
  mediaPromise = null;
}

export async function fetchSiteMedia(): Promise<MediaDocument[]> {
  if (mediaCache) {
    return mediaCache;
  }

  if (!mediaPromise) {
    mediaPromise = fetch('/api/admin/media')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load media.');
        }
        const payload = await readJsonResponse<unknown>(response, []);
        const list = Array.isArray(payload) ? (payload as MediaDocument[]) : [];
        mediaCache = list;
        return list;
      })
      .catch((error) => {
        console.error('Unable to load site media', error);
        return [];
      });
  }

  return mediaPromise;
}

export function getMediaItem(media: MediaDocument[], section: string, fallbackUrl = '') {
  const match = media.find((item) => item.section === section);
  return match?.url || fallbackUrl;
}

export function getMediaItemByKey(media: MediaDocument[], key: string, fallbackUrl = '') {
  const match = media.find((item) => item.key === key);
  return match?.url || fallbackUrl;
}

export function getMediaSection(media: MediaDocument[], section: string, type?: string) {
  return [...media.filter((item) => item.section === section && (type ? item.type === type : true))].sort(
    (a, b) => {
      if (type === 'homepage') {
        return (a.position ?? 0) - (b.position ?? 0);
      }
      return (a.order ?? 0) - (b.order ?? 0);
    }
  );
}

export function getMediaGallery(media: MediaDocument[]) {
  return getMediaSection(media, 'gallery', 'full');
}
