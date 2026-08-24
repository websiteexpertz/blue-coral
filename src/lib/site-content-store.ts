import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { DEFAULT_SITE_CONTENT, normalizeSiteContent, type SiteContentData } from '@/lib/site-content-types';

export { DEFAULT_SITE_CONTENT } from '@/lib/site-content-types';
export type { SiteContentData } from '@/lib/site-content-types';

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'website-content.json');

function ensureStorage() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  if (!existsSync(storageFile)) {
    writeFileSync(storageFile, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf8');
  }
}

function readStorage(): SiteContentData {
  ensureStorage();
  try {
    const raw = readFileSync(storageFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SiteContentData>;
    return normalizeSiteContent(parsed);
  } catch {
    writeFileSync(storageFile, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf8');
    return DEFAULT_SITE_CONTENT;
  }
}

function writeStorage(data: SiteContentData) {
  ensureStorage();
  writeFileSync(storageFile, JSON.stringify(data, null, 2), 'utf8');
}

export function getSiteContentData(): SiteContentData {
  return readStorage();
}

export function saveSiteContentData(input: Partial<SiteContentData> | SiteContentData): SiteContentData {
  const nextData = normalizeSiteContent(input);
  writeStorage(nextData);
  return nextData;
}
