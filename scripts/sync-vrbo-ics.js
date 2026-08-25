const { MongoClient } = require('mongodb');
const { fetchAndParseIcs } = require('./parse-ics');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'blue-coral';
const ICS_URL = process.env.VRBO_ICS_URL;

if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}
if (!ICS_URL) {
  console.error('VRBO_ICS_URL not set');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('bookings');

  try {
    const items = await fetchAndParseIcs(ICS_URL);
    const now = new Date();

    for (const b of items) {
      await col.updateOne(
        { uid: b.uid, sourceUrl: ICS_URL },
        { $set: { start: new Date(b.start), end: new Date(b.end), allDay: !!b.allDay, raw: b, lastSeenAt: now } },
        { upsert: true }
      );
    }

    // Optionally mark stale bookings not seen in this run
    const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14); // 14 days
    await col.updateMany({ sourceUrl: ICS_URL, lastSeenAt: { $lt: threshold } }, { $set: { stale: true } });

    console.log(`Synced ${items.length} booking items from ${ICS_URL}`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
