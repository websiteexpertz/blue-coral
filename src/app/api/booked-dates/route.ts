import { NextResponse } from 'next/server';
import { GET as getBookings } from '@/app/api/ics/bookings/route';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const response = await getBookings(request);
  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  return NextResponse.json({ success: true, bookedRanges: payload });
}
