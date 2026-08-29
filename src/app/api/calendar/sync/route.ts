import { NextResponse } from 'next/server';
import { getBookings } from '@/lib/bookings-store';

export const runtime = 'nodejs';

function isActiveBookingStatus(status?: string): boolean {
  const normalized = String(status ?? '').trim().toLowerCase();
  return normalized === 'approved' || normalized === 'confirmed' || normalized === 'active';
}

function toDateString(value: string | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line: string, maxLength = 75): string {
  if (line.length <= maxLength) return line;

  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += maxLength) {
    chunks.push(line.slice(index, index + maxLength));
  }

  return chunks.join('\r\n ');
}

export async function GET() {
  try {
    const bookings = await getBookings();
    const activeBookings = bookings.filter((booking) => isActiveBookingStatus(booking.status));

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Blue Coral Landing//Direct Bookings//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Blue Coral Landing Direct Bookings',
      'X-WR-TIMEZONE:UTC',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1M',
      'X-PUBLISHED-TTL:PT1M',
    ];

    for (const booking of activeBookings) {
      const startDate = toDateString(booking.checkIn);
      const endDate = toDateString(booking.checkOut);
      if (!startDate || !endDate) continue;

      const summary = 'Booked via main website';
      const guestName = booking.name?.trim() || 'Guest';
      const description = `Booked via main website for ${guestName}. Stay: ${booking.checkIn} to ${booking.checkOut}.`;
      const uid = `booking-${booking.id}@bluecorallanding.local`;
      const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${endDate}`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE',
        'X-MICROSOFT-MSNCALENDAR-ALLDAYEVENT:TRUE',
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');

    const ics = lines.join('\r\n');

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error generating calendar ICS feed:', error);
    return NextResponse.json(
      { error: 'Unable to generate calendar feed.' },
      { status: 500 }
    );
  }
}
