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

export function useSiteMedia() {
  const [media, setMedia] = useState<MediaDocument[]>([]);

  useEffect(() => {
    let isMounted = true;

    clearSiteMediaCache();

    const loadMedia = async () => {
      const items = await fetchSiteMedia();
      if (isMounted) {
        setMedia(items);
      }
    };

    void loadMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    media,
    getItem: (section: string, fallback = '') => getMediaItem(media, section, fallback),
    getItemByKey: (key: string, fallback = '') => getMediaItemByKey(media, key, fallback),
    getGallery: () => getMediaGallery(media),
    getSection: (section: string, type?: string) => getMediaSection(media, section, type),
  };
}
