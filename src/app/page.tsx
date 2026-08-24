import React from 'react';
import '@/styles/tailwind.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyExperience from '@/app/components/PropertyExperience';
import { getSiteContentData } from '@/lib/site-content-store';

export default function HomePage() {
  const siteContent = getSiteContentData();

  return (
    <>
      <Header />
      <PropertyExperience initialContent={siteContent} />
      <Footer />
    </>
  );
}
