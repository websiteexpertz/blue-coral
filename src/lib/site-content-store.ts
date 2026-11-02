import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getDb } from '@/lib/mongodb';
import { DEFAULT_SITE_CONTENT, normalizeSiteContent, type SiteContentData } from '@/lib/site-content-types';

export { DEFAULT_SITE_CONTENT } from '@/lib/site-content-types';
export type { SiteContentData } from '@/lib/site-content-types';

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'website-content.json');

const MONGO_URI = process.env.MONGODB_URI;

function isClosedTopologyError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as { message?: string }).message || '');
  return (
    (error as { name?: string }).name === 'MongoTopologyClosedError' ||
    (error as { name?: string }).name === 'MongoNotConnectedError' ||
    message.includes('Topology is closed') ||
    message.includes('topology is closed') ||
    message.includes('connection pool is closed')
  );
}

async function getMongoClient() {
  if (!MONGO_URI) {
    return null;
  }

  try {
    return await getDb();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}

function readFileStorage(): SiteContentData {
  try {
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }
    if (existsSync(storageFile)) {
      const raw = readFileSync(storageFile, 'utf8');
      const parsed = JSON.parse(raw) as Partial<SiteContentData>;
      return normalizeSiteContent(parsed);
    }
  } catch (error) {
    // Silently handle read-only filesystem or parse errors
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Local storage is read-only (Vercel/Lambda environment)');
    } else {
      console.warn('Could not read local storage:', error);
    }
  }
  return DEFAULT_SITE_CONTENT;
}

function writeFileStorage(data: SiteContentData) {
  try {
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }
    writeFileSync(storageFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    // Silently handle read-only filesystem errors in production
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Skipping file write: local storage is read-only (Vercel/Lambda environment)');
    } else {
      console.error('Could not write to local storage:', error);
    }
  }
}

async function readDbStorage(): Promise<SiteContentData> {
  let client = await getMongoClient();
  if (!client) return readFileStorage();

  try {
    const coll = client.collection<{ _id: string; content: Partial<SiteContentData> }>('site_content');
    const doc = await coll.findOne({ _id: 'site' });
    if (doc && doc.content) {
      return normalizeSiteContent(doc.content as Partial<SiteContentData>);
    }

    const seed = DEFAULT_SITE_CONTENT;
    await coll.updateOne({ _id: 'site' }, { $set: { content: seed } }, { upsert: true });
    return seed;
  } catch (error) {
    console.error('MongoDB read failed, falling back to local storage.', error);
    return readFileStorage();
  }
}

async function writeDbStorage(data: SiteContentData) {
  let client = await getMongoClient();
  if (!client) {
    writeFileStorage(data);
    return;
  }

  try {
    const coll = client.collection<{ _id: string; content: SiteContentData }>('site_content');
    await coll.updateOne({ _id: 'site' }, { $set: { content: data } }, { upsert: true });
  } catch (error) {
    console.error('MongoDB write failed, falling back to local storage.', error);
    writeFileStorage(data);
  }
}

export async function getSiteContentData(): Promise<SiteContentData> {
  try {
    if (MONGO_URI) return await readDbStorage();
    return readFileStorage();
  } catch (error) {
    console.error('Unable to load site content data, using local fallback.', error);
    return readFileStorage();
  }
}

export async function saveSiteContentData(input: Partial<SiteContentData> | SiteContentData): Promise<SiteContentData> {
  const nextData = normalizeSiteContent(input);
  try {
    if (MONGO_URI) {
      await writeDbStorage(nextData);
    } else {
      writeFileStorage(nextData);
    }
    return nextData;
  } catch (error) {
    console.error('Unable to save site content data, using local fallback.', error);
    writeFileStorage(nextData);
    return nextData;
  }
}
