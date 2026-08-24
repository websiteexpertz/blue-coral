import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import SiteContentProvider from './components/site/SiteContentProvider';
import { getSiteContentData } from '@/lib/site-content-store';
import { getMediaDocuments } from '@/lib/media-store';

function resolveImageFromMedia(media: any[], key?: string) {
  if (!key) return undefined;
  const found = media.find((m) => m.key === key);
  return found?.url;
}

export const dynamic = 'force-dynamic';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const defaultSiteUrl = 'http://localhost:3000';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteUrl;
let metadataBaseUrl: URL;

try {
  metadataBaseUrl = new URL(siteUrl);
} catch {
  metadataBaseUrl = new URL(defaultSiteUrl);
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: 'Blue Coral Landing — Luxury Waterfront Villa in the Bahamas',
  description:
    "Blue Coral Landing is a four-bedroom luxury waterfront villa on Great Guana Cay, Bahamas. Stunning Fisher's Bay views, private dock access, and world-class amenities from $650/night.",
  keywords: [
    'luxury villa Bahamas',
    'Great Guana Cay rental',
    'waterfront villa Caribbean',
    'Blue Coral Landing',
    "Fisher's Bay villa",
    'Bahamas vacation rental',
  ],

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Blue Coral Landing',
    title: 'Blue Coral Landing — Luxury Waterfront Villa, Bahamas',
    description:
      "Four-bedroom luxury waterfront villa overlooking Fisher's Bay, Great Guana Cay. Private dock, ocean views, and Bahamian paradise from $650/night.",
    images: [
      {
        url: '/1.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Coral Landing luxury waterfront villa aerial view, Great Guana Cay Bahamas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Coral Landing — Luxury Waterfront Villa, Bahamas',
    description: "Four-bedroom luxury villa overlooking Fisher's Bay from $650/night.",
    images: ['/1.jpg'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteContent = await getSiteContentData();
  // Resolve common image keys to actual URLs using media documents so
  // the server-rendered HTML contains the final image URLs and doesn't
  // swap them in on the client after media fetch.
  try {
    const media = await getMediaDocuments();
    siteContent.hero.imageSrc =
      siteContent.hero.imageSrc || resolveImageFromMedia(media, siteContent.hero.imageKey);
    siteContent.about.imageSrc1 =
      siteContent.about.imageSrc1 || resolveImageFromMedia(media, siteContent.about.imageKey1);
    siteContent.about.imageSrc2 =
      siteContent.about.imageSrc2 || resolveImageFromMedia(media, siteContent.about.imageKey2);
    siteContent.location.mapImageSrc =
      siteContent.location.mapImageSrc ||
      resolveImageFromMedia(media, siteContent.location.mapImageKey);
    siteContent.thingsToDo.imageSrc =
      siteContent.thingsToDo.imageSrc ||
      resolveImageFromMedia(media, siteContent.thingsToDo.imageKey);
  } catch (err) {
    // ignore — fall back to defaults or client-side media fetch
  }

  return (
    <html suppressHydrationWarning lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className={dmSans.className}>
        <SiteContentProvider initialContent={siteContent}>{children}</SiteContentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LodgingBusiness',
              name: 'Blue Coral Landing',
              description:
                "Luxury four-bedroom waterfront villa overlooking Fisher's Bay, Great Guana Cay, Bahamas.",
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Great Guana Cay',
                addressRegion: 'Abaco',
                addressCountry: 'BS',
              },
              priceRange: '$650–$900 per night',
              amenityFeature: [
                { '@type': 'LocationFeatureSpecification', name: 'Waterfront', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Private Dock', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Backup Generator', value: true },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
