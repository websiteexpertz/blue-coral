import { NextResponse } from 'next/server';
import { getBookingsCollection } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from') ? new Date(url.searchParams.get('from') as string) : new Date();
    const to = url.searchParams.get('to') ? new Date(url.searchParams.get('to') as string) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const col = await getBookingsCollection();
    if (!col) return NextResponse.json([], { status: 503 });

    const docs = await col.find({ start: { $lt: to }, end: { $gt: from }, stale: { $ne: true } }).project({ start: 1, end: 1, uid: 1, allDay: 1 }).toArray();

    const out = docs.map((d: any) => ({ start: d.start.toISOString(), end: d.end.toISOString(), uid: d.uid, allDay: !!d.allDay }));
    return NextResponse.json(out);
  } catch (err) {
    console.error('Error in /api/ics/bookings', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
