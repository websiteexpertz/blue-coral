'use client';

import { useContext, useEffect, useState } from 'react';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-types';
import { fetchSiteContent } from '@/lib/site-content-service';
import { SiteContentContext } from './SiteContentProvider';

export function useSiteContent(initialContent?: SiteContentData) {
  const ctx = useContext(SiteContentContext);

  if (initialContent && !ctx) {
    // If an initialContent is provided but there's no provider, behave like before
    const [content, setContent] = useState<SiteContentData>(initialContent ?? DEFAULT_SITE_CONTENT);
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const next = await fetchSiteContent();
          if (mounted) setContent(next);
        } catch {
          // ignore
        }
      };
      void load();
      return () => {
        mounted = false;
      };
    }, []);
    return { content, setContent };
  }

  if (!ctx) {
    // no provider and no initialContent: fallback to defaults and fetch
    const [content, setContent] = useState<SiteContentData>(DEFAULT_SITE_CONTENT);
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const next = await fetchSiteContent();
          if (mounted) setContent(next);
        } catch {
          // ignore
        }
      };
      void load();
      return () => {
        mounted = false;
      };
    }, []);
    return { content, setContent };
  }

  // If provider exists, prefer provider state; allow overriding with initialContent
  const { content: ctxContent, setContent: ctxSet } = ctx;

  useEffect(() => {
    // background refresh to keep client up to date
    let mounted = true;
    const load = async () => {
      try {
        const next = await fetchSiteContent();
        if (mounted && JSON.stringify(next) !== JSON.stringify(ctxContent)) {
          ctxSet(next);
        }
      } catch {
        // ignore
      }
    };
    void load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { content: initialContent ?? ctxContent, setContent: ctxSet };
}
