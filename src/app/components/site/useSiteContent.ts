'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-types';
import { fetchSiteContent } from '@/lib/site-content-service';

export function useSiteContent(initialContent?: SiteContentData) {
  const [content, setContent] = useState<SiteContentData>(initialContent ?? DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      const nextContent = await fetchSiteContent();
      if (isMounted) {
        setContent(nextContent);
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return { content, setContent };
}
