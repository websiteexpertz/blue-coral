import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient } from 'mongodb';

import { DEFAULT_SITE_CONTENT, normalizeSiteContent, type SiteContentData } from '@/lib/site-content-types';

export { DEFAULT_SITE_CONTENT } from '@/lib/site-content-types';
export type { SiteContentData } from '@/lib/site-content-types';

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'website-content.json');

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 3500);
let mongoClient: MongoClient | null = null;

function createMongoClient() {
  return new MongoClient(MONGO_URI!, {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    connectTimeoutMS: MONGO_TIMEOUT_MS,
    socketTimeoutMS: MONGO_TIMEOUT_MS,
    maxPoolSize: 1,
  });
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
  if (!MONGO_URI) return null;

  try {
    if (mongoClient) {
      return mongoClient;
    }
  } catch {
    // ignore and reconnect below
  }

  try {
    mongoClient = createMongoClient();
    await Promise.race([
      mongoClient.connect(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timed out')), MONGO_TIMEOUT_MS);
      }),
    ]);
    return mongoClient;
  } catch {
    mongoClient = null;
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
    // seed
    const seed = DEFAULT_SITE_CONTENT;
    await coll.updateOne({ _id: 'site' }, { $set: { content: seed } }, { upsert: true });
    return seed;
  } catch (error) {
    if (!isClosedTopologyError(error)) throw error;
    mongoClient = null;
    client = await getMongoClient();
    if (!client) return readFileStorage();

    const db = client.db();
    const coll = db.collection<{ _id: string; content: Partial<SiteContentData> }>('site_content');
    const doc = await coll.findOne({ _id: 'site' });
    if (doc && doc.content) {
      return normalizeSiteContent(doc.content as Partial<SiteContentData>);
    }

    const seed = DEFAULT_SITE_CONTENT;
    await coll.updateOne({ _id: 'site' }, { $set: { content: seed } }, { upsert: true });
    return seed;
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
    if (!isClosedTopologyError(error)) throw error;
    mongoClient = null;
    client = await getMongoClient();
    if (!client) {
      writeFileStorage(data);
      return;
    }

    const db = client.db();
    const coll = db.collection<{ _id: string; content: SiteContentData }>('site_content');
    await coll.updateOne({ _id: 'site' }, { $set: { content: data } }, { upsert: true });
  }
}

export async function getSiteContentData(): Promise<SiteContentData> {
  if (MONGO_URI) return await readDbStorage();
  return readFileStorage();
}

export async function saveSiteContentData(input: Partial<SiteContentData> | SiteContentData): Promise<SiteContentData> {
  const nextData = normalizeSiteContent(input);
  if (MONGO_URI) {
    await writeDbStorage(nextData);
  } else {
    writeFileStorage(nextData);
  }
  return nextData;
}
