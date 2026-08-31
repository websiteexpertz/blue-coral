import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient } from 'mongodb';

import { DEFAULT_SITE_CONTENT, normalizeSiteContent, type SiteContentData } from '@/lib/site-content-types';

export { DEFAULT_SITE_CONTENT } from '@/lib/site-content-types';
export type { SiteContentData } from '@/lib/site-content-types';

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'website-content.json');

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB || 'blue-coral';
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 5000);

declare global {
  var _siteContentClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!MONGO_URI) {
  console.warn('MONGODB_URI is not defined in environment variables.');
} else {
  const options = {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    connectTimeoutMS: MONGO_TIMEOUT_MS,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
  };

  if (!global._siteContentClientPromise) {
    const client = new MongoClient(MONGO_URI, options);
    global._siteContentClientPromise = client.connect().then(() => client);
  }
  clientPromise = global._siteContentClientPromise;
}

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
  if (!MONGO_URI || !clientPromise) {
    return null;
  }

  try {
    const client = await clientPromise;
    return client;
  } catch (error) {
    // If the cached promise rejected, reset it so subsequent requests can retry
    global._siteContentClientPromise = undefined;
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}

function ensureStorage() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  if (!existsSync(storageFile)) {
    writeFileSync(storageFile, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf8');
  }
}

function readFileStorage(): SiteContentData {
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

function writeFileStorage(data: SiteContentData) {
  ensureStorage();
  writeFileSync(storageFile, JSON.stringify(data, null, 2), 'utf8');
}

async function readDbStorage(): Promise<SiteContentData> {
  let client = await getMongoClient();
  if (!client) return readFileStorage();

  try {
    const db = client.db();
    const coll = db.collection<{ _id: string; content: Partial<SiteContentData> }>('site_content');
    const doc = await coll.findOne({ _id: 'site' });
    if (doc && doc.content) {
      return normalizeSiteContent(doc.content as Partial<SiteContentData>);
    }

    const seed = DEFAULT_SITE_CONTENT;
    await coll.updateOne({ _id: 'site' }, { $set: { content: seed } }, { upsert: true });
    return seed;
  } catch (error) {
    console.error('MongoDB read failed, falling back to local storage.', error);
    global._siteContentClientPromise = undefined;
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
    const db = client.db();
    const coll = db.collection<{ _id: string; content: SiteContentData }>('site_content');
    await coll.updateOne({ _id: 'site' }, { $set: { content: data } }, { upsert: true });
  } catch (error) {
    console.error('MongoDB write failed, falling back to local storage.', error);
    global._siteContentClientPromise = undefined;
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
