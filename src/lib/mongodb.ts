import { MongoClient, type Collection, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const connectionUri = uri.includes('retryReads=') ? uri : `${uri}${uri.includes('?') ? '&' : '?'}retryReads=true`;

  const options = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    minPoolSize: 1,
    waitQueueTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    serverMonitoringMode: 'stream' as const,
  };

  const client = new MongoClient(connectionUri, options);
  return client.connect();
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

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  if (!globalCache._mongoClientPromise) {
    globalCache._mongoClientPromise = createClientPromise();
  }

  try {
    const client = await globalCache._mongoClientPromise;
    return client.db(dbName);
  } catch (error) {
    globalCache._mongoClientPromise = undefined;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getQueryCollection(): Promise<Collection<QueryDocument> | null> {
  try {
    const db = await getDb();
    return db.collection<QueryDocument>('queries');
  } catch (error) {
    console.error('MongoDB unavailable, falling back to local storage/null.', error);
    return null;
  }
}

export async function getBookingsCollection(): Promise<Collection<any> | null> {
  try {
    const db = await getDb();
    return db.collection('bookings');
  } catch (error) {
    console.error('Could not get bookings collection:', error);
    return null;
  }
}
