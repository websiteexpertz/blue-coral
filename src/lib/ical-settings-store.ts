import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getDb } from '@/lib/mongodb';

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB || 'blue-coral';
const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'ical-settings.json');

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

function readFileStorage(): IcalSettings {
  try {
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }
    if (existsSync(storageFile)) {
      return normalizeSettings(JSON.parse(readFileSync(storageFile, 'utf8')));
    }
  } catch (error) {
    // Silently handle read-only filesystem or parse errors
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Local storage is read-only (Vercel/Lambda environment)');
    } else {
      console.warn('Could not read local storage:', error);
    }
  }
  return getDefaultSettings();
}

function writeFileStorage(settings: IcalSettings): void {
  try {
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }
    writeFileSync(storageFile, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    // Silently handle read-only filesystem errors in production
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Skipping file write: local storage is read-only (Vercel/Lambda environment)');
    } else {
      console.error('Could not write to local storage:', error);
    }
  }
}

async function getMongo() {
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
    writeFileStorage(settings);
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
