const fetch = require('node-fetch');
const ical = require('node-ical');

async function fetchAndParseIcs(url, opts = {}) {
  const timeout = opts.timeout || 10000;
  const res = await fetch(url, { timeout });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  const text = await res.text();
  const data = ical.parseICS(text);
  const bookings = [];

  const now = new Date();
  const oneYear = new Date();
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  for (const k of Object.keys(data)) {
    const ev = data[k];
    if (!ev || ev.type !== 'VEVENT') continue;
    const uid = ev.uid || `${ev.summary}-${ev.start?.toISOString()}`;

    if (ev.rrule && typeof ev.rrule.between === 'function') {
      const dates = ev.rrule.between(now, oneYear, true);
      const duration = (ev.end && ev.start) ? (new Date(ev.end).getTime() - new Date(ev.start).getTime()) : 24 * 3600 * 1000;
      for (const dt of dates) {
        const s = new Date(dt);
        const e = new Date(s.getTime() + duration);
        bookings.push({ uid, start: s.toISOString(), end: e.toISOString(), allDay: !!ev.datetype });
      }
    } else if (ev.start && ev.end) {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      const allDay = ev.datetype === 'date' || (start.getHours() === 0 && end.getHours() === 0 && ((end - start) % (24 * 3600 * 1000) === 0));
      bookings.push({ uid, start: start.toISOString(), end: end.toISOString(), allDay });
    }
  }

  return bookings;
}

module.exports = { fetchAndParseIcs };
