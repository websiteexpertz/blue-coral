import { NextResponse } from 'next/server';
import { getBookingsCollection } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const start = body.start ? new Date(body.start) : null;
    const end = body.end ? new Date(body.end) : null;
    if (!start || !end) return NextResponse.json({ error: 'start and end required' }, { status: 400 });

    const col = await getBookingsCollection();
    if (!col) return NextResponse.json({ error: 'db unavailable' }, { status: 503 });

    const conflict = await col.findOne({ start: { $lt: end }, end: { $gt: start }, stale: { $ne: true } });
    return NextResponse.json({ available: !Boolean(conflict) });
  } catch (err) {
    console.error('Error in /api/ics/check-availability', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
