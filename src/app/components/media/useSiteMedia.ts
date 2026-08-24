'use client';

import { useEffect, useState } from 'react';
import {
  clearSiteMediaCache,
  fetchSiteMedia,
  getMediaGallery,
  getMediaItem,
  getMediaItemByKey,
  getMediaSection,
} from '@/lib/media-service';
import type { MediaDocument } from '@/lib/media-store';

export function useSiteMedia(initialMedia: MediaDocument[] = []) {
  const [media, setMedia] = useState<MediaDocument[]>(() => initialMedia);
  const [isLoading, setIsLoading] = useState(() => (initialMedia.length === 0));

  useEffect(() => {
    if (initialMedia.length > 0) {
      setMedia(initialMedia);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const items = await fetchSiteMedia();
        if (isMounted) {
          setMedia(items);
        }
      } catch {
        if (isMounted) {
          setMedia([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadMedia();

    return () => {
      isMounted = false;
    };
  }, [initialMedia]);

  return {
    media,
    isLoading,
    getItem: (section: string, fallback = '') => getMediaItem(media, section, fallback),
    getItemByKey: (key: string, fallback = '') => getMediaItemByKey(media, key, fallback),
    getGallery: () => getMediaGallery(media),
    getSection: (section: string, type?: string) => getMediaSection(media, section, type),
  };
}
