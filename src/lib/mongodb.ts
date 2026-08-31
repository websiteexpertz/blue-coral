import { MongoClient, type Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 3500);

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

function createMongoClient() {
  return new MongoClient(uri!, {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    connectTimeoutMS: MONGO_TIMEOUT_MS,
    socketTimeoutMS: MONGO_TIMEOUT_MS,
    maxPoolSize: 1,
  });
}

export interface QueryDocument {
  id: string;
  name: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  guests: string;
  message: string;
  createdAt: string;
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

export async function getQueryCollection(): Promise<Collection<QueryDocument> | null> {
  if (!uri) {
    return null;
  }

  try {
    if (cachedDb && cachedClient && cachedClient.topology.isConnected()) {
      return cachedDb.collection<QueryDocument>('queries');
    }

    if (!cachedClient || !cachedClient.topology.isConnected()) {
      cachedClient = createMongoClient();
      await Promise.race([
        cachedClient.connect(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('MongoDB connection timed out')), MONGO_TIMEOUT_MS);
        }),
      ]);
    }

    cachedDb = cachedClient.db(dbName);
    return cachedDb.collection<QueryDocument>('queries');
  } catch (error) {
    if (isClosedTopologyError(error)) {
      cachedClient = null;
      cachedDb = null;
      try {
        cachedClient = createMongoClient();
        await Promise.race([
          cachedClient.connect(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('MongoDB connection timed out')), MONGO_TIMEOUT_MS);
          }),
        ]);
        cachedDb = cachedClient.db(dbName);
        return cachedDb.collection<QueryDocument>('queries');
      } catch (retryError) {
        console.error('MongoDB unavailable, falling back to local storage.', retryError);
        return null;
      }
    }

    console.error('MongoDB unavailable, falling back to local storage.', error);
    return null;
  }
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }

  try {
    if (cachedDb && cachedClient && cachedClient.topology.isConnected()) return cachedDb;

    if (!cachedClient || !cachedClient.topology.isConnected()) {
      cachedClient = createMongoClient();
      await Promise.race([
        cachedClient.connect(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('MongoDB connection timed out')), MONGO_TIMEOUT_MS);
        }),
      ]);
    }

    cachedDb = cachedClient.db(dbName);
    return cachedDb;
  } catch (error) {
    if (isClosedTopologyError(error)) {
      cachedClient = null;
      cachedDb = null;
      cachedClient = createMongoClient();
      await Promise.race([
        cachedClient.connect(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('MongoDB connection timed out')), MONGO_TIMEOUT_MS);
        }),
      ]);
      cachedDb = cachedClient.db(dbName);
      return cachedDb;
    }

    console.error('MongoDB unavailable', error);
    throw error;
  }
}

export async function getBookingsCollection() {
  try {
    const db = await getDb();
    return db.collection('bookings');
  } catch (error) {
    console.error('Could not get bookings collection', error);
    return null;
  }
}
