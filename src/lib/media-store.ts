import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient, type Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'media.json');

function ensureStorage() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  if (!existsSync(storageFile)) {
    writeFileSync(storageFile, JSON.stringify([]), 'utf8');
  }
}

function readStorage(): MediaDocument[] {
  ensureStorage();
  try {
    const raw = readFileSync(storageFile, 'utf8');
    return JSON.parse(raw) as MediaDocument[];
  } catch {
    writeFileSync(storageFile, JSON.stringify([]), 'utf8');
    return [];
  }
}

function writeStorage(items: MediaDocument[]) {
  ensureStorage();
  writeFileSync(storageFile, JSON.stringify(items, null, 2), 'utf8');
}

function createId(section: string, key: string) {
  return `${section}-${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeMediaInput<T extends Record<string, unknown>>(input: T) {
  const { _id, ...rest } = input;
  return rest as T;
}

function normalizeMediaDocument(item: MediaDocument) {
  const normalized = { ...item } as MediaDocument;

  if (normalized.section === 'homepage') {
    normalized.section = 'gallery';
    normalized.type = 'homepage';
    normalized.position = normalized.position ?? normalized.order;
    normalized.order = normalized.position ?? normalized.order;
    normalized.key = normalized.key?.startsWith('gallery-homepage-')
      ? normalized.key
      : `gallery-homepage-${normalized.position ?? 1}`;
  }

  if (normalized.section === 'gallery') {
    if (!normalized.type) {
      normalized.type = 'full';
    }

    if (normalized.type === 'homepage') {
      normalized.position = normalized.position ?? normalized.order;
      normalized.order = normalized.position ?? normalized.order;
      normalized.key = normalized.key?.startsWith('gallery-homepage-')
        ? normalized.key
        : `gallery-homepage-${normalized.position ?? 1}`;
    }

    if (normalized.type === 'full') {
      normalized.order = normalized.order ?? normalized.position ?? 0;
      normalized.key = normalized.key?.startsWith('gallery-full-')
        ? normalized.key
        : normalized.key || `gallery-full-${Date.now()}`;
    }
  }

  return normalized;
}

function normalizeMediaDocuments(items: MediaDocument[]) {
  let hasChanges = false;
  const normalized = items.map((item) => {
    const next = normalizeMediaDocument(item);
    if (JSON.stringify(next) !== JSON.stringify(item)) {
      hasChanges = true;
    }
    return next;
  });
  return { normalized, hasChanges };
}

export interface MediaDocument {
  id: string;
  section: string;
  key: string;
  alt: string;
  url: string;
  type?: string;
  position?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_MEDIA_SEED: Omit<MediaDocument, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { section: 'hero', key: 'hero', alt: 'Hero image', url: '/12.jpg', order: 0 },
  { section: 'about', key: 'about', alt: 'About image', url: '/35.jpg', order: 0 },
  { section: 'contact', key: 'contact', alt: 'Contact image', url: '/33.jpg', order: 0 },
  { section: 'logo', key: 'logo', alt: 'Brand logo', url: '/logo.png', order: 0 },
  { section: 'villa-hero', key: 'villa-hero', alt: 'Villa hero image', url: '/12.jpg', order: 0 },
  { section: 'villa-about-1', key: 'villa-about-1', alt: 'Villa detail image', url: '/12.jpg', order: 0 },
  { section: 'villa-about-2', key: 'villa-about-2', alt: 'Villa detail image', url: '/13.jpg', order: 0 },
  { section: 'villa-activities', key: 'villa-activities', alt: 'Activities image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', order: 0 },
  { section: 'villa-location', key: 'villa-location', alt: 'Location image', url: 'https://images.unsplash.com/photo-1468413253725-0d5181091126', order: 0 },
  { section: 'nearby-beach', key: 'nearby-beach', alt: 'Beach image', url: '/12.jpg', order: 0 },
  { section: 'nearby-restaurants', key: 'nearby-restaurants', alt: 'Restaurant image', url: '/13.jpg', order: 0 },
  { section: 'nearby-grocery', key: 'nearby-grocery', alt: 'Grocery image', url: '/16.jpg', order: 0 },
  { section: 'nearby-dock', key: 'nearby-dock', alt: 'Dock image', url: '/17.jpg', order: 0 },
  { section: 'nearby-island', key: 'nearby-island', alt: 'Island image', url: '/20.jpg', order: 0 },
  { section: 'nearby-map', key: 'nearby-map', alt: 'Map image', url: '/21.jpg', order: 0 },
  { section: 'gallery', type: 'homepage', key: 'gallery-homepage-1', alt: 'Homepage image 1', url: '/3.jpg', order: 1, position: 1 },
  { section: 'gallery', type: 'homepage', key: 'gallery-homepage-2', alt: 'Homepage image 2', url: '/4.jpg', order: 2, position: 2 },
  { section: 'gallery', type: 'homepage', key: 'gallery-homepage-3', alt: 'Homepage image 3', url: '/5.jpg', order: 3, position: 3 },
  { section: 'gallery', type: 'homepage', key: 'gallery-homepage-4', alt: 'Homepage image 4', url: '/6.jpg', order: 4, position: 4 },
  { section: 'gallery', type: 'full', key: 'gallery-full-1', alt: 'Gallery image 1', url: '/3.jpg', order: 1 },
  { section: 'gallery', type: 'full', key: 'gallery-full-2', alt: 'Gallery image 2', url: '/4.jpg', order: 2 },
  { section: 'gallery', type: 'full', key: 'gallery-full-3', alt: 'Gallery image 3', url: '/5.jpg', order: 3 },
  { section: 'gallery', type: 'full', key: 'gallery-full-4', alt: 'Gallery image 4', url: '/6.jpg', order: 4 },
];

export async function getMediaCollection(): Promise<Collection<MediaDocument> | null> {
  if (!uri) {
    return null;
  }

  try {
    if (cachedDb) {
      return cachedDb.collection<MediaDocument>('site_media');
    }

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    cachedDb = cachedClient.db(dbName);
    return cachedDb.collection<MediaDocument>('site_media');
  } catch (error) {
    console.error('Media collection unavailable.', error);
    return null;
  }
}

export async function ensureMediaSeedData(): Promise<MediaDocument[]> {
  const collection = await getMediaCollection();
  if (collection) {
    const count = await collection.countDocuments();
    if (count > 0) {
      return collection.find({}).sort({ section: 1, order: 1, key: 1 }).toArray();
    }

    const timestamp = new Date().toISOString();
    const seededDocs = DEFAULT_MEDIA_SEED.map((item, index) => ({
      id: `${item.section}-${index}-${Date.now()}`,
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    await collection.insertMany(seededDocs);
    return seededDocs;
  }

  const documents = readStorage();
  if (documents.length > 0) {
    return documents.sort((a, b) => a.section.localeCompare(b.section) || a.order - b.order || a.key.localeCompare(b.key));
  }

  const timestamp = new Date().toISOString();
  const seededDocs = DEFAULT_MEDIA_SEED.map((item, index) => ({
    id: createId(item.section, item.key),
    ...item,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  writeStorage(seededDocs);
  return seededDocs;
}

export async function getMediaDocuments(): Promise<MediaDocument[]> {
  const collection = await getMediaCollection();
  if (collection) {
    const docs = await collection.find({}).sort({ section: 1, order: 1, key: 1 }).toArray();
    if (docs.length === 0) {
      return ensureMediaSeedData();
    }

    const { normalized, hasChanges } = normalizeMediaDocuments(docs);
    if (hasChanges) {
      for (const item of normalized) {
        await collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
    }

    return normalized;
  }

  const documents = readStorage();
  if (documents.length === 0) {
    return ensureMediaSeedData();
  }

  const { normalized, hasChanges } = normalizeMediaDocuments(documents);
  if (hasChanges) {
    writeStorage(normalized);
  }

  return normalized.sort((a, b) => a.section.localeCompare(b.section) || a.order - b.order || a.key.localeCompare(b.key));
}

export async function createMediaDocument(input: Partial<MediaDocument> & { section: string; key: string; url: string; alt?: string; order?: number }) {
  const collection = await getMediaCollection();
  const timestamp = new Date().toISOString();
  const sanitizedInput = sanitizeMediaInput(input as Record<string, unknown>);
  const doc: MediaDocument = {
    id: String((sanitizedInput.id as string | undefined) || createId(String(sanitizedInput.section || 'section'), String(sanitizedInput.key || 'item'))),
    section: String(sanitizedInput.section || 'general'),
    key: String(sanitizedInput.key || 'item'),
    alt: String(sanitizedInput.alt || ''),
    url: String(sanitizedInput.url || ''),
    type: typeof sanitizedInput.type === 'string' ? String(sanitizedInput.type) : undefined,
    position: sanitizedInput.position !== undefined ? Number(sanitizedInput.position) : undefined,
    order: Number(sanitizedInput.order ?? 0),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (!collection) {
    const documents = readStorage();
    documents.push(doc);
    writeStorage(documents);
    return doc;
  }

  await collection.insertOne(doc);
  return doc;
}

export async function updateMediaDocument(id: string, updates: Partial<Omit<MediaDocument, 'id' | 'createdAt'>>) {
  const collection = await getMediaCollection();
  const timestamp = new Date().toISOString();
  const sanitizedUpdates = sanitizeMediaInput(updates as Record<string, unknown>);

  if (!collection) {
    const documents = readStorage();
    const index = documents.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    documents[index] = {
      ...documents[index],
      ...sanitizedUpdates,
      type: typeof sanitizedUpdates.type === 'string' ? String(sanitizedUpdates.type) : documents[index].type,
      position: sanitizedUpdates.position !== undefined ? Number(sanitizedUpdates.position) : documents[index].position,
      order: sanitizedUpdates.order !== undefined ? Number(sanitizedUpdates.order) : documents[index].order,
      updatedAt: timestamp,
    } as MediaDocument;
    writeStorage(documents);
    return documents[index];
  }

  await collection.updateOne({ id }, { $set: { ...sanitizedUpdates, updatedAt: timestamp } });
  return collection.findOne({ id });
}

export async function deleteMediaDocument(id: string) {
  const collection = await getMediaCollection();

  if (!collection) {
    const documents = readStorage();
    const nextDocuments = documents.filter((item) => item.id !== id);
    if (nextDocuments.length === documents.length) {
      return false;
    }

    writeStorage(nextDocuments);
    return true;
  }

  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function reorderGalleryMedia(items: Array<{ id: string; order: number }>) {
  const collection = await getMediaCollection();
  const timestamp = new Date().toISOString();

  if (!collection) {
    const documents = readStorage();
    const updated = documents.map((item) => {
      const match = items.find((entry) => entry.id === item.id);
      return match ? { ...item, order: match.order, updatedAt: timestamp } : item;
    });
    writeStorage(updated);
    return updated.filter((item) => item.section === 'gallery').sort((a, b) => a.order - b.order);
  }

  for (const item of items) {
    await collection.updateOne({ id: item.id }, { $set: { order: item.order, updatedAt: timestamp } });
  }

  return collection.find({ section: 'gallery' }).sort({ order: 1, key: 1 }).toArray();
}
