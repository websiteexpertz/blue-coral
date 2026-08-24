import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient } from 'mongodb';

import { DEFAULT_SITE_CONTENT, normalizeSiteContent, type SiteContentData } from '@/lib/site-content-types';

export { DEFAULT_SITE_CONTENT } from '@/lib/site-content-types';
export type { SiteContentData } from '@/lib/site-content-types';

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'website-content.json');

const MONGO_URI = process.env.MONGODB_URI;
let mongoClient: MongoClient | null = null;

async function getMongoClient() {
  if (!MONGO_URI) return null;
  if (mongoClient) return mongoClient;
  mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  return mongoClient;
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
  const client = await getMongoClient();
  if (!client) return readFileStorage();
  const db = client.db();
  const coll = db.collection('site_content');
  const doc = await coll.findOne({ _id: 'site' });
  if (doc && doc.content) {
    return normalizeSiteContent(doc.content as Partial<SiteContentData>);
  }
  // seed
  const seed = DEFAULT_SITE_CONTENT;
  await coll.updateOne({ _id: 'site' }, { $set: { content: seed } }, { upsert: true });
  return seed;
}

async function writeDbStorage(data: SiteContentData) {
  const client = await getMongoClient();
  if (!client) {
    writeFileStorage(data);
    return;
  }
  const db = client.db();
  const coll = db.collection('site_content');
  await coll.updateOne({ _id: 'site' }, { $set: { content: data } }, { upsert: true });
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
