'use client';

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingCalendar({ rangeLookaheadDays = 365, onSelect }: { rangeLookaheadDays?: number; onSelect?: (d: Date | undefined) => void }) {
  const [disabledRanges, setDisabledRanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + rangeLookaheadDays);

    setLoading(true);
    fetch(`/api/ics/bookings?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then(r => r.json())
      .then((data) => {
        const ranges = data.map((b: any) => ({ from: new Date(b.start), to: new Date(new Date(b.end).getTime() - 1) }));
        setDisabledRanges(ranges);
      })
      .catch((err) => {
        console.error('Failed to load bookings', err);
        setDisabledRanges([]);
      })
      .finally(() => setLoading(false));
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
