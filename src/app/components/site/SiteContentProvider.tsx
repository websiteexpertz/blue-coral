'use client';

import React, { createContext, useState, useEffect } from 'react';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-types';
import { fetchSiteContent } from '@/lib/site-content-service';

type ContextType = {
  content: SiteContentData;
  setContent: (next: SiteContentData) => void;
};

export const SiteContentContext = createContext<ContextType | null>(null);

export default function SiteContentProvider({
  initialContent,
  children,
}: {
  initialContent?: SiteContentData;
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SiteContentData>(initialContent ?? DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const next = await fetchSiteContent();
        if (mounted) setContent(next);
      } catch {
        // keep initial content on error
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, setContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}
