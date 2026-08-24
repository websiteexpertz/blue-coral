'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useSiteMedia } from '@/app/components/media/useSiteMedia';
import { useSiteContent } from '@/app/components/site/useSiteContent';

interface FormData {
  name: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  guests: string;
  message: string;
}

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  arrivalDate: '',
  departureDate: '',
  guests: '',
  message: '',
};

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => formatDateForInput(new Date());

const getAvailabilityRangeWindow = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setMonth(end.getMonth() + 6);

  return {
    startDate: formatDateForInput(start),
    endDate: formatDateForInput(end),
  };
};

const getDateRange = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const range: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    range.push(formatDateForInput(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return range;
};

const getEarliestDepartureDate = (arrivalDate: string) => {
  if (!arrivalDate) {
    return undefined;
  }

  const arrival = new Date(`${arrivalDate}T00:00:00`);
  const minimumStayEnd = new Date(arrival);
  minimumStayEnd.setDate(arrival.getDate() + 3);

  const isJuly30Arrival =
    arrival.getFullYear() === 2026 && arrival.getMonth() === 6 && arrival.getDate() === 30;

  if (isJuly30Arrival) {
    const augustFirst = new Date(arrival.getFullYear(), arrival.getMonth() + 1, 1);
    return formatDateForInput(augustFirst > minimumStayEnd ? augustFirst : minimumStayEnd);
  }

  return formatDateForInput(minimumStayEnd);
};

export default function ContactCTASection({
  initialArrivalDate,
  initialDepartureDate,
}: {
  initialArrivalDate?: string;
  initialDepartureDate?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const { getItem } = useSiteMedia();
  const { content } = useSiteContent();

  useEffect(() => {
    // Populate arrival/departure when provided from calendar selection.
    // Only update if the incoming value is present and different from current form value.
    setForm((prev) => {
      const next = { ...prev } as FormData;
      let changed = false;
      if (initialArrivalDate && initialArrivalDate !== prev.arrivalDate) {
        next.arrivalDate = initialArrivalDate;
        changed = true;
      }
      if (initialDepartureDate && initialDepartureDate !== prev.departureDate) {
        next.departureDate = initialDepartureDate;
        changed = true;
      }
      return changed ? next : prev;
    });

    const loadBlockedDates = async () => {
      try {
        const { startDate, endDate } = getAvailabilityRangeWindow();
        const response = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        setBlockedDates(
          new Set((payload.bookings ?? []).map((booking: { date: string }) => booking.date))
        );
      } catch {
        setBlockedDates(new Set());
      }
    };

    void loadBlockedDates();

    const intervalId = window.setInterval(() => {
      void loadBlockedDates();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [initialArrivalDate, initialDepartureDate]);

  const validateDateRange = (nextForm: FormData) => {
    if (!nextForm.arrivalDate || !nextForm.departureDate) {
      return null;
    }

    const arrival = new Date(`${nextForm.arrivalDate}T00:00:00`);
    const departure = new Date(`${nextForm.departureDate}T00:00:00`);
    const earliestDeparture = getEarliestDepartureDate(nextForm.arrivalDate);
    const earliestDepartureDate = earliestDeparture
      ? new Date(`${earliestDeparture}T00:00:00`)
      : null;

    if (departure < arrival) {
      return 'Departure date cannot be earlier than the arrival date.';
    }

    if (earliestDepartureDate && departure < earliestDepartureDate) {
      return 'Minimum stay is 3 nights. Please choose a later departure date.';
    }

    const rangeDates = getDateRange(nextForm.arrivalDate, nextForm.departureDate);
    const hasUnavailableDate = rangeDates.some((dateValue) => blockedDates.has(dateValue));

    if (hasUnavailableDate) {
      return 'The selected dates are no longer available. Please choose different dates.';
    }

    return null;
  };

  const isDateBlocked = (dateValue: string) => blockedDates.has(dateValue);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value } as FormData;

    if (name === 'arrivalDate' || name === 'departureDate') {
      const selectedDate = value;
      if (selectedDate && blockedDates.has(selectedDate)) {
        nextForm[name] = '';
        setForm(nextForm);
        setDateError('The selected dates are no longer available. Please choose different dates.');
        return;
      }

      if (name === 'departureDate' && nextForm.arrivalDate && selectedDate) {
        const rangeDates = getDateRange(nextForm.arrivalDate, selectedDate);
        const hasUnavailableDate = rangeDates.some((dateValue) => blockedDates.has(dateValue));
        if (hasUnavailableDate) {
          nextForm.departureDate = '';
          setForm(nextForm);
          setDateError(
            'The selected dates are no longer available. Please choose different dates.'
          );
          return;
        }
      }

      if (name === 'arrivalDate' && nextForm.departureDate && selectedDate) {
        const rangeDates = getDateRange(selectedDate, nextForm.departureDate);
        const hasUnavailableDate = rangeDates.some((dateValue) => blockedDates.has(dateValue));
        if (hasUnavailableDate) {
          nextForm.arrivalDate = '';
          setForm(nextForm);
          setDateError(
            'The selected dates are no longer available. Please choose different dates.'
          );
          return;
        }
      }

      setForm(nextForm);
      setDateError(validateDateRange(nextForm));
      return;
    }

    setForm(nextForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextDateError = validateDateRange(form);

    if (nextDateError) {
      setDateError(nextDateError);
      setSubmissionError(null);
      return;
    }

    setDateError(null);
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Unable to submit your inquiry.');
      }

      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'Submission failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200';

  const labelClass = 'label-caps text-muted-foreground mb-1.5 block';

  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 lg:py-28 px-6 lg:px-10 bg-foreground relative overflow-hidden"
      aria-label="Contact and inquiry form"
    >
      {/* Background image */}
      <div className="absolute inset-0 opacity-10">
        <AppImage
          src={getItem('contact', '/33.jpg')}
          alt="Aerial view of turquoise Bahamian waters, dark atmospheric, night, deep blue ocean"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left — info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-8 h-px bg-accent" />
                <span className="label-caps text-white/50">Contact</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="section-headline text-white mb-6"
              >
                {content.contact.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/50 text-base leading-relaxed mb-10"
              >
                {content.contact.text}
              </motion.p>

              {/* Contact details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-4"
              >
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: content.contact.email,
                    href: `mailto:${content.contact.email}`,
                  },
                  {
                    icon: Phone,
                    label: 'Phone',
                    value: content.contact.phone,
                    href: `tel:${content.contact.phone.replace(/[^+0-9]/g, '')}`,
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: content.neighborhood.title,
                    href: content.neighborhood.mapLink,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 group"
                    aria-label={`${label}: ${value}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-300">
                      <Icon size={16} className="text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="label-caps text-white/30 mb-0.5">{label}</p>
                      <p className="text-white/70 text-sm group-hover:text-white transition-colors duration-300">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Pricing reminder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <p className="font-serif text-3xl font-light text-white mb-1">
                From $650<span className="text-white/40 text-xl"> / night</span>
              </p>
              <p className="label-caps text-white/30">+10% Bahamas VAT · 4 Bedrooms · Waterfront</p>
            </motion.div>
          </div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="bg-background rounded-2xl p-8 lg:p-10 shadow-2xl">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-center py-16 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Send size={28} className="text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-2xl font-light text-foreground">
                    Inquiry Received
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    Thank you for your interest in Blue Coral Landing. We&apos;ll be in touch within
                    24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(initialForm);
                      setSubmissionError(null);
                    }}
                    className="mt-4 label-caps text-primary border-b border-accent pb-0.5 hover:text-accent transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Vacation inquiry form">
                  <h3 className="font-serif text-2xl font-light text-foreground mb-8">
                    Request Information
                  </h3>
                  {submissionError ? (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submissionError}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className={labelClass}>
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={inputClass}
                        autoComplete="name"
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass}
                        autoComplete="email"
                      />
                    </div>
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className={inputClass}
                        autoComplete="tel"
                      />
                    </div>
                    {/* Arrival */}
                    <div>
                      <label htmlFor="arrivalDate" className={labelClass}>
                        Arrival Date *
                      </label>
                      <input
                        id="arrivalDate"
                        name="arrivalDate"
                        type="date"
                        required
                        value={form.arrivalDate}
                        onChange={handleChange}
                        min={getTodayDate()}
                        className={inputClass}
                        title={
                          form.arrivalDate && isDateBlocked(form.arrivalDate)
                            ? 'Unavailable'
                            : undefined
                        }
                      />
                    </div>
                    {/* Departure */}
                    <div>
                      <label htmlFor="departureDate" className={labelClass}>
                        Departure Date *
                      </label>
                      <input
                        id="departureDate"
                        name="departureDate"
                        type="date"
                        required
                        value={form.departureDate}
                        onChange={handleChange}
                        min={getEarliestDepartureDate(form.arrivalDate)}
                        className={`${inputClass} ${dateError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={Boolean(dateError)}
                        aria-describedby={dateError ? 'departure-date-error' : undefined}
                        title={
                          form.departureDate && isDateBlocked(form.departureDate)
                            ? 'Unavailable'
                            : undefined
                        }
                      />
                      {dateError ? (
                        <p id="departure-date-error" className="mt-2 text-sm text-red-600">
                          {dateError}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Unavailable dates are blocked automatically using the latest approved
                        bookings.
                      </p>
                    </div>
                    {/* Guests */}
                    <div className="sm:col-span-2">
                      <label htmlFor="guests" className={labelClass}>
                        Number of Guests *
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        required
                        value={form.guests}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">Select guests</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Message */}
                    <div className="sm:col-span-2">
                      <label htmlFor="message" className={labelClass}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your trip, any special requests, or questions you may have..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    {/* Submit */}
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="luxury-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Send size={14} aria-hidden="true" />
                        {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                      </button>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        No payment required. This is an inquiry only.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
