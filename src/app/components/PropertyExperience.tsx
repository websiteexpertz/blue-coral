'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import AmenitiesAccordion from '@/app/components/AmenitiesAccordion';
import AppImage from '@/components/ui/AppImage';
import {
  Anchor,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Waves,
  Wifi,
  Trees,
  UtensilsCrossed,
  Car,
  Monitor,
} from 'lucide-react';
import ContactCTASection from '@/app/components/ContactCTASection';
import { useSiteMedia } from '@/app/components/media/useSiteMedia';
import { useSiteContent } from '@/app/components/site/useSiteContent';

const highlightIcons = [Anchor, Waves, Compass, Sparkles];

const homepagePreviewFallbacks = [
  { key: 'gallery-homepage-1', url: '/3.jpg', alt: 'Homepage image 1' },
  { key: 'gallery-homepage-2', url: '/4.jpg', alt: 'Homepage image 2' },
  { key: 'gallery-homepage-3', url: '/5.jpg', alt: 'Homepage image 3' },
  { key: 'gallery-homepage-4', url: '/6.jpg', alt: 'Homepage image 4' },
];

const amenitiesByCategory = [
  {
    title: 'Comfort & Essentials',
    items: [
      'Onsite parking available',
      'Pet-friendly',
      'Air conditioning',
      'Washer',
      'Dryer',
      'Fully equipped kitchen',
      'Refrigerator',
      'Microwave',
      'Stove',
      'Oven',
      'Dishes & utensils',
      'Coffee maker',
      'Kettle',
      'Blender',
      'Toaster',
      'Linens provided',
      'Essentials',
      'Non-smoking',
    ],
  },
  {
    title: 'Entertainment & Connectivity',
    items: ['Wireless internet', 'WiFi', 'Internet access', 'Television', 'Roku TV', 'Stereo'],
  },
  {
    title: 'Outdoor & Property Features',
    items: [
      'Barbecue grill',
      'Garden',
      'Parking',
      'Waterfront',
      'Sea of Abaco',
      'Beach',
      'Oceanfront',
      '60 feet of waterfront with a dock',
      'Whole house backup generator',
    ],
  },
  {
    title: 'Safety & Peace of Mind',
    items: ['Smoke detector', 'Carbon monoxide detector'],
  },
  {
    title: 'Activities Nearby',
    items: [
      'Swimming',
      'Sailing',
      'Water skiing',
      'Snorkeling',
      'Scuba diving',
      'Boating',
      'Kayaking',
      'Surfing',
      'Windsurfing',
      'Hiking',
      'Cycling',
      'Ecotourism',
      'Birdwatching',
      'Fishing',
    ],
  },
];

const bedrooms = [
  {
    title: 'Bedroom 1',
    details: '1 Queen Bed • Quiet, comfortable retreat for two',
  },
  {
    title: 'Bedroom 2',
    details: '1 Queen Bed • Spacious second bedroom for couples or family use',
  },
  {
    title: 'Bedroom 3',
    details: '1 Queen Bed and 1 Twin Bed Bunk • Ideal for kids or extra guests',
  },
  {
    title: 'Bedroom 4',
    details: '1 King Bed with water view • The most scenic suite in the villa',
  },
];

const bathrooms = [
  'Bathroom 1 • Toilet • Shower only',
  'Bathroom 2 • Toilet • Shower only',
  'Bathroom 3 • Toilet • Shower only',
  'Bathroom 4 • Toilet • Shower only',
];

const spaces = [
  'Dining area',
  'Seating for 6 people',
  'Kitchen',
  'Lawn/garden',
  'Walk to Waterfront',
  'Porch/veranda',
  'Porch Swing with water view',
];

const features = [
  {
    title: 'Luxury Waterfront Escape',
    body: 'A newly refreshed cottage with a sunroom, wet bar, and spacious dining room for memorable stays.',
  },
  {
    title: 'Families & Boaters Welcome',
    body: 'Ideal for leisurely island days, reef adventures, and effortless access to restaurants and shops.',
  },
  {
    title: 'Authentic Great Guana Cay',
    body: 'Discover the calm of the Sea of Abaco while staying close to famous spots like Nippers and Grabbers.',
  },
];

const attractions = [
  { name: 'Guana Cay Beach', description: 'Soft sand and clear water just moments away.' },
  {
    name: 'Nippers',
    description: 'A classic island stop for sunsets, cocktails, and live energy.',
  },
  { name: 'Conch Shack', description: 'Casual Bahamian dining with a laid-back local feel.' },
  {
    name: 'Treasure Cay Marina',
    description: 'Perfect for boats, charters, and coastal adventures.',
  },
];

const activities = [
  'Snorkeling',
  'Scuba Diving',
  'Fishing',
  'Boating',
  'Island Hopping',
  'Beach Walking',
  'Swimming',
  'Surfing',
];

const rules = [
  { label: 'Check-in', value: 'After 3:00 PM' },
  { label: 'Check-out', value: 'Before 10:00 AM' },
  { label: 'Children', value: 'Allowed • Ages 0–17' },
  { label: 'Pets', value: 'Allowed' },
  { label: 'Smoking', value: 'Not permitted' },
  { label: 'Events', value: 'No events allowed' },
];

const importantNotes = [
  'Extra-person charges may apply and vary depending on property policy.',
  'Government-issued photo identification and a credit card, debit card, or cash deposit may be required at check-in for incidental charges.',
  'Special requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed.',
  'Onsite parties or group events are strictly prohibited.',
  'Host has not indicated whether there is a carbon monoxide detector on the property; consider bringing a portable detector.',
  'Host has not indicated whether there is a smoke detector on the property.',
  'This property has outdoor spaces, such as balconies, patios, and terraces, which may not be suitable for children; contact the property prior to arrival if you have concerns.',
];

const reviews = [
  {
    quote:
      'The home felt like a private sanctuary — the sunset views were unreal and the dock made every day effortless.',
    author: 'Alicia & Marcus',
  },
  {
    quote:
      'Beautifully designed, comfortable, and perfectly placed for beach days, boat rides, and family time.',
    author: 'The Larsen Family',
  },
  {
    quote: 'We loved the balance of luxury and authenticity. It was the ideal island escape.',
    author: 'Nadia P.',
  },
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="label-caps text-primary mb-4">{eyebrow}</p>
      <h2 className="section-headline text-foreground mb-4">{title}</h2>
      <p className="text-lg text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDayOfMonth.getDay();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - leadingDays + 1);
    return date;
  });
}

function getDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const range: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    range.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return range;
}

export default function PropertyExperience({
  initialContent,
  initialMedia = [],
}: {
  initialContent?: import('@/lib/site-content-types').SiteContentData;
  initialMedia?: import('@/lib/media-store').MediaDocument[];
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const initialDate = new Date();
    initialDate.setDate(1);
    initialDate.setHours(0, 0, 0, 0);
    return initialDate;
  });
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selection, setSelection] = useState<{ checkIn: string | null; checkOut: string | null }>({
    checkIn: null,
    checkOut: null,
  });
  const { getItem, getItemByKey, getGallery, getSection } = useSiteMedia(initialMedia);
  const { content } = useSiteContent(initialContent);
  const homepagePreviewItems = getSection('gallery', 'homepage');
  const heroStats = content.hero.stats;
  const highlights = content.about.highlights.map((item, index) => ({
    title: item.title,
    description: item.description,
    icon: highlightIcons[index % highlightIcons.length],
  }));

  const amenitiesSection = content.amenities;
  const roomsSection = content.rooms;
  const nearbyAttractionsSection = content.nearbyAttractions;
  const thingsToDoSection = content.thingsToDo;
  const houseRulesSection = content.houseRules;
  const importantInformationSection = content.importantInformation;
  const neighborhoodSection = content.neighborhood;
  const faqSection = content.faq;
  const guestReviewsSection = content.guestReviews;
  const contactSection = content.contact;

  const openPreview = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  const goPrevPreview = useCallback(() => {
    setPreviewIndex((prev) =>
      prev !== null && homepagePreviewItems.length > 0
        ? (prev - 1 + homepagePreviewItems.length) % homepagePreviewItems.length
        : null
    );
  }, [homepagePreviewItems.length]);

  const goNextPreview = useCallback(() => {
    setPreviewIndex((prev) =>
      prev !== null && homepagePreviewItems.length > 0
        ? (prev + 1) % homepagePreviewItems.length
        : null
    );
  }, [homepagePreviewItems.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft') goPrevPreview();
      if (e.key === 'ArrowRight') goNextPreview();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewIndex, closePreview, goPrevPreview, goNextPreview]);

  const today = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }, []);

  const minVisibleMonth = useMemo(() => {
    const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstOfCurrentMonth.setHours(0, 0, 0, 0);
    return firstOfCurrentMonth;
  }, [today]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = useMemo(() => formatMonthLabel(currentMonth), [currentMonth]);

  const loadAvailability = useCallback(async () => {
    setIsLoadingAvailability(true);
    try {
      const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      const response = await fetch(
        `/api/booked-dates?from=${from.toISOString()}&to=${to.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Unable to load availability');
      }

      const payload = await response.json();
      const nextBookedDates = new Set<string>();
      for (const booking of payload.bookedRanges ?? []) {
        const start = new Date(`${booking.start.slice(0, 10)}T00:00:00`);
        const end = new Date(`${booking.end.slice(0, 10)}T00:00:00`);

        for (const date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
          nextBookedDates.add(getDateKey(date));
        }
      }
      setBookedDates(nextBookedDates);
    } catch (error) {
      console.error('Unable to load availability', error);
      setBookedDates(new Set());
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadAvailability();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [loadAvailability]);

  useEffect(() => {
    setSelection({ checkIn: null, checkOut: null });
  }, [currentMonth]);

  const handleDateSelect = useCallback(
    (dateKey: string, isDisabled: boolean) => {
      if (isDisabled) {
        return;
      }

      const { checkIn, checkOut } = selection;
      if (!checkIn || checkOut) {
        setSelection({ checkIn: dateKey, checkOut: null });
        return;
      }

      if (dateKey < checkIn) {
        setSelection({ checkIn: dateKey, checkOut: null });
        return;
      }

      const rangeDates = getDateRange(checkIn, dateKey);
      const hasUnavailableInRange = rangeDates.some((day) => bookedDates.has(day));

      if (!hasUnavailableInRange) {
        setSelection({ checkIn, checkOut: dateKey });
      }
    },
    [bookedDates, selection]
  );

  return (
    <main>
      <section id="hero" className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <AppImage
            src={
              content.hero.imageSrc ||
              getItemByKey(content.hero.imageKey, getItem('villa-hero', '/12.jpg'))
            }
            alt="Waterfront cottage on the Sea of Abaco with a private dock and turquoise water"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.18),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-16 pt-32 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-10 bg-accent" />
              <p className="label-caps text-white/80">{content.hero.eyebrow}</p>
            </div>
            <h1 className="hero-headline max-w-4xl text-white">{content.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {content.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="#contact" className="luxury-btn-primary">
                {content.hero.ctaPrimary}
                <ArrowRight size={15} />
              </Link>
              <Link href="#villa" className="luxury-btn-outline">
                {content.hero.ctaSecondary}
              </Link>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-4 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md"
              >
                <p className="font-serif text-2xl text-white">{stat.value}</p>
                <p className="label-caps mt-1 text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <SectionHeading
                eyebrow={content.about.eyebrow}
                title={content.about.title}
                text={content.about.text}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="rounded-[1.5rem] border border-border bg-white/80 p-6 shadow-[0_20px_70px_rgba(27,79,107,0.08)] backdrop-blur"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon size={20} />
                      </div>
                      <h3 className="sub-headline text-xl text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-[linear-gradient(135deg,rgba(27,79,107,0.06),rgba(201,169,110,0.08))] p-3 shadow-[0_25px_80px_rgba(27,79,107,0.12)] h-full min-h-0">
              <div className="grid grid-rows-2 gap-3 h-full min-h-0">
                <div className="relative w-full overflow-hidden rounded-[1.25rem]">
                  <AppImage
                    src={
                      content.about.imageSrc1 || getItemByKey(content.about.imageKey1, '/12.jpg')
                    }
                    alt="Bright and airy interior with tropical décor and open living space"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative w-full overflow-hidden rounded-[1.25rem]">
                  <AppImage
                    src={
                      content.about.imageSrc2 || getItemByKey(content.about.imageKey2, '/13.jpg')
                    }
                    alt="Whitewashed interiors with natural textures and island charm"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Image Gallery"
              title="Every angle feels like a postcard."
              text="A mix of beachfront light, open-air living, and Bahamian color brings the story of the cottage to life."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {homepagePreviewItems.map((image, index) => (
              <motion.div
                key={image.id ?? image.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group overflow-hidden rounded-[1.5rem] border border-border bg-white cursor-pointer"
                onClick={() => openPreview(index)}
              >
                <div className="relative h-72 overflow-hidden">
                  <AppImage
                    src={image.url || getItemByKey(image.key, '/3.jpg')}
                    alt={image.alt || 'Luxury waterfront villa detail'}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Link href="/gallery" className="luxury-btn-primary" aria-label="Explore more">
                Explore more
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>

          <AnimatePresence>
            {previewIndex !== null && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePreview}
              >
                <div className="absolute inset-0" />
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    closePreview();
                  }}
                  aria-label="Close image preview"
                >
                  ✕
                </button>
                <button
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrevPreview();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNextPreview();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight />
                </button>

                <motion.div
                  className="relative w-full max-w-5xl max-h-[85vh] z-30"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-black">
                    <AppImage
                      src={
                        homepagePreviewItems[previewIndex].url ||
                        getItemByKey(homepagePreviewItems[previewIndex].key, '/3.jpg')
                      }
                      alt={
                        homepagePreviewItems[previewIndex].alt || 'Luxury waterfront villa detail'
                      }
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-4 text-center text-white/70">
                    {previewIndex + 1} / {homepagePreviewItems.length}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section
        id="villa"
        className="px-6 lg:px-10 relative overflow-hidden bg-gradient-to-b from-[#FCFAF6] to-[#F8F4EC]"
        style={{ paddingTop: 140, paddingBottom: 140 }}
      >
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 flex justify-start">
          <div className="w-1/2 h-full bg-[radial-gradient(closest-side,rgba(248,244,236,0.35),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
            {/* LEFT - editorial heading */}
            <div className="lg:w-[45%]">
              <p className="text-accent text-sm font-medium mb-4">{amenitiesSection.eyebrow}</p>
              <h2 className="font-serif text-[clamp(2.25rem,4vw,4rem)] font-light leading-tight text-foreground">
                {amenitiesSection.title}
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-prose">
                {amenitiesSection.text}
              </p>
            </div>

            {/* RIGHT - compact feature cards + stats + accordion */}
            <div className="lg:w-[55%]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {amenitiesSection.highlights.map((feature, i) => (
                  <motion.div
                    key={`${feature.title}-${i}`}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="rounded-2xl border border-border bg-white p-5 shadow-sm flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-accent">
                        <Sparkles size={18} />
                      </span>
                      <h4 className="text-lg font-semibold text-foreground leading-tight">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-auto">{feature.body}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {amenitiesSection.categories.slice(0, 4).map((category) => (
                  <div
                    key={category.title}
                    className="rounded-xl border border-border bg-white p-3 text-center text-sm"
                  >
                    <div className="text-muted-foreground text-xs">{category.title}</div>
                    <div className="font-medium text-foreground mt-1">
                      {category.items.slice(0, 1).join(', ') || 'Details'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Accordion lists */}
              <AmenitiesAccordion groups={amenitiesSection.categories} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionHeading
              eyebrow={roomsSection.eyebrow}
              title={roomsSection.title}
              text={roomsSection.text}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(27,79,107,0.05)]">
              <div className="mb-5 flex items-center gap-3 text-primary">
                <BedDouble size={18} />
                <span className="label-caps">Bedrooms</span>
              </div>
              <div className="space-y-4">
                {roomsSection.bedrooms.map((bedroom, index) => (
                  <motion.div
                    key={`${bedroom.title}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="rounded-2xl border border-border bg-soft p-4"
                  >
                    <h3 className="sub-headline text-lg text-foreground">{bedroom.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {bedroom.details}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(27,79,107,0.05)]">
                <div className="mb-5 flex items-center gap-3 text-primary">
                  <Bath size={18} />
                  <span className="label-caps">Bathrooms</span>
                </div>
                <div className="space-y-3">
                  {roomsSection.bathrooms.map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-soft px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(27,79,107,0.05)]">
                <div className="mb-5 flex items-center gap-3 text-primary">
                  <Waves size={18} />
                  <span className="label-caps">Spaces</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roomsSection.spaces.map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-soft px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rates" className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[2rem] border border-border bg-foreground p-8 text-white shadow-[0_25px_80px_rgba(27,79,107,0.15)] lg:p-10">
            <p className="label-caps text-accent">{nearbyAttractionsSection.eyebrow}</p>
            <h2 className="section-headline mt-3 max-w-xl text-white">
              {nearbyAttractionsSection.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              {nearbyAttractionsSection.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {nearbyAttractionsSection.pills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:min-h-[420px]">
            <div className="flex min-h-[0] min-w-0 flex-col justify-start overflow-visible rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,250,0.96))] p-5 shadow-[0_20px_70px_rgba(27,79,107,0.06)] sm:p-6">
              <div className="flex items-center gap-3 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={17} />
                </div>
                <p className="label-caps text-[0.86rem] sm:text-[0.95rem]">Highlights</p>
              </div>
              <div className="mt-4 space-y-4">
                {nearbyAttractionsSection.attractions.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white/80 p-4"
                  >
                    <h3 className="font-serif text-lg text-foreground break-words">{item.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground break-words">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-h-[0] min-w-0 flex-col justify-start overflow-visible rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,250,0.96))] p-5 shadow-[0_20px_70px_rgba(27,79,107,0.06)] sm:p-6">
              <div className="flex items-center gap-3 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UtensilsCrossed size={17} />
                </div>
                <p className="label-caps text-[0.86rem] sm:text-[0.95rem]">Restaurants</p>
              </div>
              <div className="mt-4 space-y-0">
                {[
                  'Grabbers — 3 min drive',
                  'Conch Shack — 4 min drive',
                  'Nippers — 3 min drive',
                  "Kidd's Cove Seafood Bar & Grill — 3 min drive",
                  'The Dune Bar & Grill — 9 min drive',
                ].map((item, index) => (
                  <div
                    key={item}
                    className={`flex min-w-0 items-center gap-3 py-3 text-[clamp(0.95rem,1.2vw,1.08rem)] leading-7 text-foreground ${index < 4 ? 'border-b border-border/60' : ''} transition hover:bg-white/70`}
                  >
                    <Car size={15} className="shrink-0 text-primary" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="flex flex-col rounded-[2rem] border border-border bg-white p-8 shadow-[0_20px_70px_rgba(27,79,107,0.05)] lg:p-10">
            <SectionHeading
              eyebrow={thingsToDoSection.eyebrow}
              title={thingsToDoSection.title}
              text={thingsToDoSection.text}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {thingsToDoSection.activities.map((activity) => (
                <div
                  key={activity}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3"
                >
                  <Waves size={16} className="text-accent" />
                  <span className="text-sm font-medium text-foreground">{activity}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex-1 overflow-hidden rounded-[1.5rem] border border-border bg-muted/30">
              <div className="relative h-full min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
                <AppImage
                  src={
                    thingsToDoSection.imageSrc ||
                    getItemByKey(
                      thingsToDoSection.imageKey,
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
                    )
                  }
                  alt="Tropical island shoreline with clear water"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-[linear-gradient(135deg,rgba(27,79,107,0.08),rgba(201,169,110,0.08))] p-8 shadow-[0_20px_70px_rgba(27,79,107,0.05)] lg:p-10">
            <p className="label-caps text-primary">{houseRulesSection.eyebrow}</p>
            <h2 className="section-headline mt-3 text-foreground">{houseRulesSection.title}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {houseRulesSection.rules.map((rule) => (
                <div
                  key={rule.label}
                  className="rounded-[1.25rem] border border-border bg-white/80 p-4"
                >
                  <p className="label-caps text-muted-foreground">{rule.label}</p>
                  <p className="mt-2 font-medium text-foreground">{rule.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-border bg-white/80 p-6">
              <p className="label-caps text-primary">{importantInformationSection.eyebrow}</p>
              <h3 className="font-serif text-xl text-foreground mt-3">
                {importantInformationSection.title}
              </h3>
              <div className="mt-4 space-y-3">
                {importantInformationSection.notes.map((note) => (
                  <div
                    key={note}
                    className="rounded-2xl border border-border bg-muted/40 px-4 py-3"
                  >
                    <p className="text-sm leading-relaxed text-foreground">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_70px_rgba(27,79,107,0.05)]">
              <div className="relative h-full min-h-[360px] overflow-hidden lg:min-h-[460px]">
                <AppImage
                  src={getItem(
                    'villa-location',
                    'https://images.unsplash.com/photo-1468413253725-0d5181091126'
                  )}
                  alt="Aerial view of the Bahamas shoreline and tropical island landscape"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_20px_70px_rgba(27,79,107,0.05)] lg:p-10">
              <p className="label-caps text-primary">{neighborhoodSection.eyebrow}</p>
              <h2 className="section-headline mt-3 text-foreground">{neighborhoodSection.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {neighborhoodSection.text}
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href={neighborhoodSection.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 transition hover:border-primary/40 hover:bg-white"
                >
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm text-foreground">Open location on Google Maps</span>
                </a>
                {neighborhoodSection.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3"
                  >
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-sm text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionHeading
              eyebrow={guestReviewsSection.eyebrow}
              title={guestReviewsSection.title}
              text={guestReviewsSection.text}
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {guestReviewsSection.reviews.map((review) => (
              <div
                key={review.author}
                className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(27,79,107,0.05)]"
              >
                <p className="text-lg leading-relaxed text-foreground">“{review.quote}”</p>
                <p className="mt-6 label-caps text-primary">{review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-white p-8 shadow-[0_20px_70px_rgba(27,79,107,0.05)] lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="label-caps text-primary">Availability Calendar</p>
              <h2 className="section-headline mt-3 text-foreground">
                Reserve your ideal window in paradise.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Select your preferred dates for a stay that blends relaxed island time with the
                comfort of a refined waterfront home.
              </p>
            </div>
            <div className="w-full max-w-2xl rounded-[1.5rem] border border-border bg-muted/40 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-primary">
                  <CalendarDays size={18} />
                  <span className="label-caps">Live Availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                      )
                    }
                    disabled={
                      currentMonth.getFullYear() === minVisibleMonth.getFullYear() &&
                      currentMonth.getMonth() === minVisibleMonth.getMonth()
                    }
                    className="rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <span className="min-w-[10rem] text-center text-sm font-semibold text-foreground">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                      )
                    }
                    className="rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground transition hover:border-primary hover:text-primary"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:gap-2 sm:text-xs">
                {weekdayHeaders.map((day) => (
                  <span key={day} className="py-2">
                    {day}
                  </span>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={monthLabel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  {calendarDays.map((day) => {
                    const dateKey = getDateKey(day);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isPastDate = day < today;
                    const isBooked = bookedDates.has(dateKey);
                    const isDisabled = !isCurrentMonth || isPastDate || isBooked;
                    const isSelected =
                      !!selection.checkIn &&
                      !!selection.checkOut &&
                      dateKey >= selection.checkIn &&
                      dateKey <= selection.checkOut;
                    const isStart = dateKey === selection.checkIn;
                    const isEnd = dateKey === selection.checkOut;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        title={isBooked ? 'Reserved' : isDisabled ? 'Unavailable' : 'Available'}
                        onClick={() => handleDateSelect(dateKey, isDisabled)}
                        disabled={!isCurrentMonth || isPastDate}
                        className={`flex h-10 w-full items-center justify-center rounded-full text-sm font-medium transition-all duration-200 sm:h-11 ${
                          isBooked
                            ? 'cursor-not-allowed bg-red-50/80 text-red-700 line-through'
                            : isCurrentMonth && !isPastDate
                              ? 'cursor-pointer text-foreground hover:border hover:border-primary hover:bg-primary/10 hover:text-primary'
                              : 'cursor-not-allowed text-muted-foreground/70'
                        } ${isSelected || isStart || isEnd ? 'bg-primary text-white shadow-sm' : ''}`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-white/80 p-3 text-sm text-muted-foreground">
                {isLoadingAvailability ? (
                  <span>Refreshing availability…</span>
                ) : bookedDates.size > 0 ? (
                  <span>Booked dates are highlighted and unavailable for selection.</span>
                ) : (
                  <span>All dates are currently available. Book your perfect stay.</span>
                )}
              </div>

              {selection.checkIn && selection.checkOut ? (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const target = document.getElementById('contact');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        window.setTimeout(() => {
                          const nameInput = document.querySelector(
                            '#contact input[name="name"]'
                          ) as HTMLInputElement | null;
                          nameInput?.focus();
                        }, 450);
                      }
                    }}
                    className="luxury-btn-primary"
                    aria-label="Book selected dates"
                  >
                    Book Now — {selection.checkIn} → {selection.checkOut}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 pb-24 lg:px-10">
        <ContactCTASection
          initialArrivalDate={selection.checkIn ?? undefined}
          initialDepartureDate={selection.checkOut ?? undefined}
        />
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <SectionHeading
              eyebrow={faqSection.eyebrow}
              title={faqSection.title}
              text={faqSection.text}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {(faqSection.items ?? []).map((item) => (
              <div
                key={item.question}
                className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(27,79,107,0.05)]"
              >
                <p className="font-serif text-xl text-foreground">{item.question}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
