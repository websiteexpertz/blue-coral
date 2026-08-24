'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Trash2, Plus, Search } from 'lucide-react';
import PageHeader from '@/app/components/admin/PageHeader';
import type { BookingRecord, BookingStatus } from '@/lib/bookings-store';

const statusClasses: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  cancelled: 'bg-slate-100 text-slate-700',
};

const createEmptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  specialRequests: '',
  status: 'pending' as BookingStatus,
});

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [sortKey, setSortKey] = useState<'createdAt' | 'checkIn' | 'checkOut'>('createdAt');
  const [form, setForm] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: 'delete' | 'reject';
  } | null>(null);

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Unable to load bookings.');
      }
      const payload = await response.json();
      setBookings(Array.isArray(payload) ? payload : []);
    } catch {
      setNotification({ type: 'error', message: 'Unable to load booking records.' });
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...bookings]
      .filter((booking) => {
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
        if (!query) return true;
        return [booking.name, booking.email, booking.phone, booking.checkIn, booking.checkOut]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (sortKey === 'checkIn') return a.checkIn.localeCompare(b.checkIn);
        if (sortKey === 'checkOut') return a.checkOut.localeCompare(b.checkOut);
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [bookings, search, statusFilter, sortKey]);

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = { ...form, guests: Number(form.guests) };
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { id: editingId, ...payload } : payload;

      const response = await fetch('/api/bookings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to save booking.');
      }

      setNotification({
        type: 'success',
        message: editingId ? 'Booking updated successfully.' : 'Booking created successfully.',
      });
      resetForm();
      await loadBookings();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save booking.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: BookingStatus) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to update booking status.');
      }
      setNotification({
        type: 'success',
        message: `Booking ${nextStatus} successfully.`,
      });
      await loadBookings();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update booking status.',
      });
    }
  };

  const confirmDelete = async () => {
    if (!confirmAction) return;

    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmAction.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to delete booking.');
      }
      setNotification({ type: 'success', message: 'Booking deleted successfully.' });
      setConfirmAction(null);
      await loadBookings();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to delete booking.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Manage guest reservations, review requests, and update booking status from one central page."
      />

      {notification ? (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.message}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]"
        >
          <div className="mb-6">
            <p className="label-caps text-primary">Booking form</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {editingId ? 'Edit booking' : 'Create booking'}
            </h2>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-slate-500">
              Guest Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-500">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-500">
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-500">
                Check-in
                <input
                  required
                  type="date"
                  value={form.checkIn}
                  onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-500">
                Check-out
                <input
                  required
                  type="date"
                  value={form.checkOut}
                  onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-500">
              Guests
              <input
                required
                type="number"
                min="1"
                value={form.guests}
                onChange={(event) => setForm({ ...form, guests: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-500">
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as BookingStatus })
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-500">
              Special requests
              <textarea
                rows={3}
                value={form.specialRequests}
                onChange={(event) => setForm({ ...form, specialRequests: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-70"
            >
              <Plus size={16} />
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Booking'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="label-caps text-primary">Booking requests</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Reservation queue</h2>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bookings"
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | BookingStatus)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={sortKey}
                onChange={(event) =>
                  setSortKey(event.target.value as 'createdAt' | 'checkIn' | 'checkOut')
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              >
                <option value="createdAt">Sort by created date</option>
                <option value="checkIn">Sort by check-in</option>
                <option value="checkOut">Sort by check-out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-100 text-left uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                      No bookings match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-slate-200">
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-slate-900">{booking.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{booking.email}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {booking.phone || 'No phone'}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-500">
                        <div>
                          {booking.checkIn} → {booking.checkOut}
                        </div>
                        <div className="mt-2 text-xs">
                          {booking.specialRequests || 'No special requests'}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClasses[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                name: booking.name,
                                email: booking.email,
                                phone: booking.phone,
                                checkIn: booking.checkIn,
                                checkOut: booking.checkOut,
                                guests: String(booking.guests),
                                specialRequests: booking.specialRequests,
                                status: booking.status,
                              });
                              setEditingId(booking.id);
                            }}
                            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          {booking.status !== 'approved' ? (
                            <button
                              type="button"
                              onClick={() => void handleStatusChange(booking.id, 'approved')}
                              className="rounded-full bg-emerald-600 px-3 py-2 text-sm text-white transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          ) : null}
                          {booking.status !== 'rejected' ? (
                            <button
                              type="button"
                              onClick={() => setConfirmAction({ id: booking.id, type: 'reject' })}
                              className="rounded-full bg-rose-600 px-3 py-2 text-sm text-white transition hover:bg-rose-700"
                            >
                              Reject
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ id: booking.id, type: 'delete' })}
                            className="rounded-full border border-rose-200 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl">
            <p className="label-caps text-primary">Confirm action</p>
            <h3 className="mt-3 text-xl font-semibold text-foreground">
              {confirmAction.type === 'delete' ? 'Delete booking?' : 'Reject booking?'}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {confirmAction.type === 'delete'
                ? 'This will permanently remove the booking from active records.'
                : 'This will mark the request as rejected and update its status accordingly.'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    void confirmDelete();
                  } else {
                    void handleStatusChange(confirmAction.id, 'rejected');
                    setConfirmAction(null);
                  }
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                  confirmAction.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {confirmAction.type === 'delete' ? 'Delete' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
