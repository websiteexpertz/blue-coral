import { NextResponse } from 'next/server';
import ical from 'node-ical';

export const runtime = 'nodejs';

const AIRBNB_ICAL_URL =
  process.env.AIRBNB_ICAL_URL ||
  'https://www.airbnb.com/calendar/ical/35916488.ics?t=a2fdaaacfd5e415c9898b64b26f0077a';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from')
      ? new Date(url.searchParams.get('from') as string)
      : new Date();
    const to = url.searchParams.get('to')
      ? new Date(url.searchParams.get('to') as string)
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    const feedResponse = await fetch(AIRBNB_ICAL_URL, {
      next: { revalidate: 300 },
    });

    if (!feedResponse.ok) {
      throw new Error(`Airbnb iCal request failed with status ${feedResponse.status}`);
    }

    const feedText = await feedResponse.text();
    const webEvents = ical.parseICS(feedText);
    const dateOnlyRanges = new Map<string, { start: string; end: string }>();

    for (const eventBlock of feedText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? []) {
      const uid = eventBlock.match(/^UID:(.+)$/m)?.[1]?.trim();
      const start = eventBlock.match(/^DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})$/m);
      const end = eventBlock.match(/^DTEND;VALUE=DATE:(\d{4})(\d{2})(\d{2})$/m);

      if (uid && start && end) {
        dateOnlyRanges.set(uid, {
          start: `${start[1]}-${start[2]}-${start[3]}`,
          end: `${end[1]}-${end[2]}-${end[3]}`,
        });
      }
    }

    const bookings = Object.values(webEvents)
      .filter(
        (event): event is ical.VEvent =>
          Boolean(event && event.type === 'VEVENT' && event.start && event.end)
      )
      .map((event) => {
        const dateOnlyRange = event.uid ? dateOnlyRanges.get(event.uid) : undefined;
        const start = dateOnlyRange
          ? new Date(`${dateOnlyRange.start}T00:00:00.000Z`)
          : new Date(event.start!);
        const end = dateOnlyRange
          ? new Date(`${dateOnlyRange.end}T00:00:00.000Z`)
          : new Date(event.end!);

        return {
        start,
        end,
        uid: event.uid || `${event.summary || 'Reserved'}-${event.start.toISOString()}`,
          allDay: Boolean(dateOnlyRange) || event.datetype === 'date',
        };
      })
      .filter((event) => event.start < to && event.end > from)
      .map((event) => ({
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        uid: event.uid,
        allDay: event.allDay,
      }));

    return NextResponse.json(bookings, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('Error in /api/ics/bookings', err);
    return NextResponse.json({ error: 'Failed to parse iCal feed' }, { status: 500 });
  }
}
