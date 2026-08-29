'use client';

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingCalendar({
  rangeLookaheadDays = 365,
  onSelect,
}: {
  rangeLookaheadDays?: number;
  onSelect?: (d: Date | undefined) => void;
}) {
  const [disabledRanges, setDisabledRanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: number | undefined;

    const loadBookings = async () => {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + rangeLookaheadDays);

      if (isMounted) setLoading(true);
      try {
        const response = await fetch(
          `/api/ics/bookings?from=${from.toISOString()}&to=${to.toISOString()}`,
          {
            cache: 'no-store',
          }
        );
        if (!response.ok) throw new Error('Unable to load bookings.');
        const data = await response.json();
        const intervalMinutes = Number(response.headers.get('X-iCal-Refresh-Minutes'));
        if (isMounted) {
          const refreshIntervalMs =
            Number.isFinite(intervalMinutes) && intervalMinutes > 0
              ? intervalMinutes * 60 * 1000
              : 5 * 60 * 1000;
          if (refreshTimer) window.clearInterval(refreshTimer);
          refreshTimer = window.setInterval(() => void loadBookings(), refreshIntervalMs);
        }
        if (isMounted) {
          const ranges = data.map((b: any) => ({
            from: new Date(b.start),
            to: new Date(new Date(b.end).getTime() - 1),
          }));
          setDisabledRanges(ranges);
        }
      } catch (err) {
        console.error('Failed to load bookings', err);
        if (isMounted) setDisabledRanges([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadBookings();
    return () => {
      isMounted = false;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [rangeLookaheadDays]);

  return (
    <div>
      {loading && <div className="text-sm text-gray-500">Loading availability…</div>}
      <DayPicker
        mode="single"
        disabled={disabledRanges}
        modifiersClassNames={{ disabled: 'opacity-40 pointer-events-none' }}
        onSelect={onSelect}
      />
    </div>
  );
}
