import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB || 'blue-coral';
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 5000);
const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'ical-settings.json');

declare global {
  var _icalSettingsClientPromise: Promise<MongoClient> | undefined;
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

  if (!global._icalSettingsClientPromise) {
    const client = new MongoClient(MONGO_URI, options);
    global._icalSettingsClientPromise = client.connect().then(() => client);
  }
  clientPromise = global._icalSettingsClientPromise;
}

export const DEFAULT_ICAL_REFRESH_MINUTES = 5;
const DEFAULT_ICAL_URL =
  'https://www.airbnb.com/calendar/ical/35916488.ics?t=a2fdaaacfd5e415c9898b64b26f0077a';

export interface IcalSettings {
  url: string;
  refreshMinutes: number;
  updatedAt?: string;
}

interface IcalSettingsDocument extends IcalSettings {
  _id: string;
}

function getDefaultSettings(): IcalSettings {
  return {
    url: process.env.AIRBNB_ICAL_URL || DEFAULT_ICAL_URL,
    refreshMinutes: DEFAULT_ICAL_REFRESH_MINUTES,
  };
}

function normalizeSettings(input: Partial<IcalSettings>): IcalSettings {
  const refreshMinutes = Number(input.refreshMinutes);
  return {
    url: typeof input.url === 'string' ? input.url.trim() : '',
    refreshMinutes: Number.isFinite(refreshMinutes)
      ? Math.min(60, Math.max(1, Math.round(refreshMinutes)))
      : DEFAULT_ICAL_REFRESH_MINUTES,
    ...(input.updatedAt ? { updatedAt: input.updatedAt } : {}),
  };
}

function ensureStorage() {
  if (!existsSync(storageDir)) mkdirSync(storageDir, { recursive: true });
  if (!existsSync(storageFile)) {
    writeFileSync(storageFile, JSON.stringify(getDefaultSettings(), null, 2), 'utf8');
  }
}

function readFileStorage(): IcalSettings {
  ensureStorage();
  try {
    return normalizeSettings(JSON.parse(readFileSync(storageFile, 'utf8')));
  } catch {
    const defaults = getDefaultSettings();
    writeFileSync(storageFile, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
}

async function getMongo() {
  if (!MONGO_URI || !clientPromise) {
    return null;
  }

  try {
    const client = await clientPromise;
    return client;
  } catch (error) {
    // If the cached promise rejected, reset it so subsequent requests can retry
    global._icalSettingsClientPromise = undefined;
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}

export async function getIcalSettings(): Promise<IcalSettings> {
  const client = await getMongo();
  if (!client) return readFileStorage();

  const collection = client.db(MONGO_DB).collection<IcalSettingsDocument>('site_settings');
  const document = await collection.findOne({ _id: 'ical' });
  if (!document) {
    const defaults = getDefaultSettings();
    await collection.updateOne(
      { _id: 'ical' },
      { $set: defaults },
      { upsert: true }
    );
    return defaults;
  }
  return normalizeSettings(document as Partial<IcalSettings>);
}

export async function saveIcalSettings(input: Partial<IcalSettings>): Promise<IcalSettings> {
  const settings = normalizeSettings({ ...input, updatedAt: new Date().toISOString() });
  const client = await getMongo();
  if (!client) {
    ensureStorage();
    writeFileSync(storageFile, JSON.stringify(settings, null, 2), 'utf8');
    return settings;
  }

  const collection = client.db(MONGO_DB).collection<IcalSettingsDocument>('site_settings');
  await collection.updateOne(
    { _id: 'ical' },
    { $set: settings },
    { upsert: true }
  );
  return settings;
}
