import { MongoClient, type Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

export interface AvailabilityBooking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

interface BookingDocument {
  _id?: { toString(): string };
  status?: string;
  checkIn?: string;
  checkOut?: string;
  arrivalDate?: string;
  departureDate?: string;
  startDate?: string;
  endDate?: string;
}

const availabilityCache = new Map<string, { value: AvailabilityBooking[]; expiresAt: number }>();
const CACHE_TTL_MS = 15_000;

function normalizeDate(value: string | Date | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(value: Date, amount: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function collectDates(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let cursor = start;
  while (cursor <= end) {
    dates.push(toDateOnly(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

async function getBookingCollection(): Promise<Collection<BookingDocument> | null> {
  if (!uri) {
    return null;
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    if (!cachedDb) {
      cachedDb = cachedClient.db(dbName);
    }

    return cachedDb.collection<BookingDocument>('bookings');
  } catch (error) {
    console.error('Availability store unavailable.', error);
    return null;
  }
}

export function clearAvailabilityCache() {
  availabilityCache.clear();
}

export async function getAvailabilityBookingsForMonth(
  startDate: string,
  endDate: string
): Promise<AvailabilityBooking[]> {
  const monthKey = `${startDate}:${endDate}`;
  const cached = availabilityCache.get(monthKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const collection = await getBookingCollection();
  if (!collection) {
    return [];
  }

  const monthStart = normalizeDate(startDate);
  const monthEnd = normalizeDate(endDate);

  if (!monthStart || !monthEnd) {
    return [];
  }

  try {
    const docs = await collection
      .find<BookingDocument>({
        $or: [
          { status: 'approved' },
          { status: 'confirmed' },
          { status: 'active' },
          { status: { $exists: false } },
          { status: '' },
        ],
      })
      .project<BookingDocument>({
        _id: 1,
        status: 1,
        checkIn: 1,
        checkOut: 1,
        arrivalDate: 1,
        departureDate: 1,
        startDate: 1,
        endDate: 1,
      })
      .toArray();

    const bookings = docs
      .map((doc) => {
        const start = normalizeDate(doc.checkIn ?? doc.arrivalDate ?? doc.startDate);
        const end = normalizeDate(doc.checkOut ?? doc.departureDate ?? doc.endDate);

        if (!start || !end) {
          return null;
        }

        const normalizedStart = new Date(start);
        const normalizedEnd = new Date(end);

        const overlapsMonth = normalizedStart <= monthEnd && normalizedEnd >= monthStart;
        if (!overlapsMonth) {
          return null;
        }

        return {
          id: doc._id?.toString() ?? `${start.toISOString()}-${end.toISOString()}`,
          status: doc.status ?? 'confirmed',
          checkIn: toDateOnly(normalizedStart),
          checkOut: toDateOnly(normalizedEnd),
        };
      })
      .filter((value): value is AvailabilityBooking => Boolean(value));

    const result = bookings.flatMap((booking) => {
      const start = normalizeDate(booking.checkIn);
      const end = normalizeDate(booking.checkOut);
      if (!start || !end) {
        return [];
      }
      return collectDates(start, end).map((date) => ({ ...booking, date }));
    });

    const normalized = result.map(({ date, ...booking }) => ({ ...booking, date }));

    availabilityCache.set(monthKey, {
      value: normalized,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return normalized;
  } catch (error) {
    console.error('Failed to load availability bookings.', error);
    return [];
  }
}
