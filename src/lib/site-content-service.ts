import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-types';
import { readJsonResponse } from '@/lib/api-response';

let siteContentCache: SiteContentData | null = null;
let siteContentPromise: Promise<SiteContentData> | null = null;

export function clearSiteContentCache() {
  siteContentCache = null;
  siteContentPromise = null;
}

export async function fetchSiteContent(): Promise<SiteContentData> {
  if (siteContentCache) {
    return siteContentCache;
  }

  if (!siteContentPromise) {
    siteContentPromise = fetch('/api/admin/content')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load website content.');
        }

        const payload = await readJsonResponse<unknown>(response, DEFAULT_SITE_CONTENT);
        const nextContent = payload && typeof payload === 'object' ? (payload as SiteContentData) : DEFAULT_SITE_CONTENT;
        siteContentCache = nextContent;
        return nextContent;
      })
      .catch((error) => {
        console.error('Unable to load website content', error);
        return DEFAULT_SITE_CONTENT;
      });
  }

  return siteContentPromise;
}
