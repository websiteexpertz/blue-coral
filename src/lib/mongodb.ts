import { MongoClient, type Collection, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';
const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS || 5000);

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn('MONGODB_URI is not defined in environment variables.');
} else {
  const options = {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    connectTimeoutMS: MONGO_TIMEOUT_MS,
    socketTimeoutMS: 20000,
    maxPoolSize: 5, // Optimal pool size for Atlas Free Tier
  };

  // Reuse the connection promise globally across hot-reloads and serverless runs
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().then(() => client);
  }
  clientPromise = global._mongoClientPromise;
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
  if (!uri || !clientPromise) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    // If the cached promise rejected (e.g. initial network drop), reset it so subsequent requests can retry
    global._mongoClientPromise = undefined;
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

export default clientPromise!;
