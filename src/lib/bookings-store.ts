import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MongoClient, type Collection } from 'mongodb';
import { clearAvailabilityCache } from '@/lib/availability-store';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 5000);

declare global {
  var _bookingsStoreClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn('MONGODB_URI is not defined in environment variables.');
} else {
  const options = {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    connectTimeoutMS: MONGO_TIMEOUT_MS,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
  };

  if (!global._bookingsStoreClientPromise) {
    const client = new MongoClient(uri, options);
    global._bookingsStoreClientPromise = client.connect().then(() => client);
  }
  clientPromise = global._bookingsStoreClientPromise;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BookingRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

interface BookingDocument {
  id: string;
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  status?: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

const storageDir = join(process.cwd(), 'data');
const storageFile = join(storageDir, 'bookings.json');

function ensureStorage() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }

  if (!existsSync(storageFile)) {
    writeFileSync(storageFile, JSON.stringify([]), 'utf8');
  }
}

function readStorage(): BookingRecord[] {
  ensureStorage();
  try {
    const raw = readFileSync(storageFile, 'utf8');
    return JSON.parse(raw) as BookingRecord[];
  } catch {
    writeFileSync(storageFile, JSON.stringify([]), 'utf8');
    return [];
  }
}

function writeStorage(bookings: BookingRecord[]) {
  ensureStorage();
  writeFileSync(storageFile, JSON.stringify(bookings, null, 2), 'utf8');
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeStatus(status?: string): BookingStatus {
  switch (status) {
    case 'approved':
    case 'rejected':
    case 'cancelled':
      return status;
    default:
      return 'pending';
  }
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

async function getBookingCollection(): Promise<Collection<BookingDocument> | null> {
  if (!uri || !clientPromise) {
    return null;
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection<BookingDocument>('bookings');
    await collection.createIndex({ checkIn: 1 });
    await collection.createIndex({ checkOut: 1 });
    await collection.createIndex({ status: 1 });
    return collection;
  } catch (error) {
    // If the cached promise rejected, reset it so subsequent requests can retry
    global._bookingsStoreClientPromise = undefined;
    console.error('Booking store unavailable.', error);
    return null;
  }
}

function validateBookingPayload(payload: Partial<BookingRecord>, excludeId?: string) {
  const errors: string[] = [];

  if (!payload.name || !String(payload.name).trim()) {
    errors.push('Guest name is required.');
  }

  if (!payload.email || !String(payload.email).trim()) {
    errors.push('Email is required.');
  }

  if (!payload.checkIn) {
    errors.push('Check-in date is required.');
  }

  if (!payload.checkOut) {
    errors.push('Check-out date is required.');
  }

  if (payload.checkIn && payload.checkOut) {
    const start = parseDate(String(payload.checkIn));
    const end = parseDate(String(payload.checkOut));

    if (!start || !end) {
      errors.push('Please provide valid dates.');
    } else if (end < start) {
      errors.push('Check-out date cannot be earlier than check-in date.');
    }
  }

  if (typeof payload.guests === 'undefined' || Number(payload.guests) < 1) {
    errors.push('Guest count is required.');
  }

  return errors;
}

async function checkForApprovedOverlap(
  range: string[],
  excludeId?: string
): Promise<boolean> {
  const existingBookings = await getBookings();
  const occupiedDates = new Set<string>();

  for (const booking of existingBookings) {
    if (booking.id === excludeId) {
      continue;
    }

    if (booking.status !== 'approved') {
      continue;
    }

    for (const date of getDateRange(booking.checkIn, booking.checkOut)) {
      occupiedDates.add(date);
    }
  }

  return range.some((date) => occupiedDates.has(date));
}

export async function getBookings(): Promise<BookingRecord[]> {
  const collection = await getBookingCollection();
  if (collection) {
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      checkIn: doc.checkIn,
      checkOut: doc.checkOut,
      guests: Number(doc.guests) || 1,
      specialRequests: doc.specialRequests || '',
      status: normalizeStatus(doc.status),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  return readStorage().sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export async function createBooking(payload: Omit<BookingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingRecord> {
  const normalizedPayload = {
    ...payload,
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    specialRequests: String(payload.specialRequests || '').trim(),
    guests: Number(payload.guests) || 1,
    status: normalizeStatus(payload.status),
  };

  const validationErrors = validateBookingPayload(normalizedPayload);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const booking: BookingRecord = {
    id: createId(),
    ...normalizedPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const range = getDateRange(booking.checkIn, booking.checkOut);
  if (booking.status === 'approved' && range.length > 0) {
    const overlaps = await checkForApprovedOverlap(range);
    if (overlaps) {
      throw new Error('The selected dates overlap with an existing approved booking.');
    }
  }

  const collection = await getBookingCollection();
  if (collection) {
    await collection.insertOne(booking as BookingDocument);
    clearAvailabilityCache();
    return booking;
  }

  const bookings = readStorage();
  bookings.unshift(booking);
  writeStorage(bookings);
  return booking;
}

export async function updateBooking(
  id: string,
  updates: Partial<Omit<BookingRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BookingRecord | null> {
  const existing = (await getBookings()).find((booking) => booking.id === id);
  if (!existing) {
    return null;
  }

  const nextBooking: BookingRecord = {
    ...existing,
    ...updates,
    name: String(updates.name ?? existing.name).trim(),
    email: String(updates.email ?? existing.email).trim(),
    phone: String(updates.phone ?? existing.phone).trim(),
    specialRequests: String(updates.specialRequests ?? existing.specialRequests).trim(),
    guests: Number(updates.guests ?? existing.guests) || 1,
    status: normalizeStatus(updates.status ?? existing.status),
    checkIn: updates.checkIn ?? existing.checkIn,
    checkOut: updates.checkOut ?? existing.checkOut,
    updatedAt: new Date().toISOString(),
  };

  const validationErrors = validateBookingPayload(nextBooking);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const range = getDateRange(nextBooking.checkIn, nextBooking.checkOut);
  if (nextBooking.status === 'approved' && range.length > 0) {
    const overlaps = await checkForApprovedOverlap(range, id);
    if (overlaps) {
      throw new Error('The selected dates overlap with an existing approved booking.');
    }
  }

  const collection = await getBookingCollection();
  if (collection) {
    await collection.updateOne({ id }, { $set: nextBooking });
    clearAvailabilityCache();
    return nextBooking;
  }

  const bookings = readStorage().map((booking) => (booking.id === id ? nextBooking : booking));
  writeStorage(bookings);
  clearAvailabilityCache();
  return nextBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const collection = await getBookingCollection();
  if (collection) {
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  const bookings = readStorage();
  const filtered = bookings.filter((booking) => booking.id !== id);
  if (filtered.length === bookings.length) {
    return false;
  }
  writeStorage(filtered);
  clearAvailabilityCache();
  return true;
}
