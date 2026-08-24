'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useSiteMedia } from '@/app/components/media/useSiteMedia';

export default function GalleryPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { getGallery } = useSiteMedia();
  const galleryItems = getGallery();

  // Transform media items to gallery format
  const galleryImages = useMemo(() => {
    if (galleryItems.length === 0) {
      return [];
    }
    return galleryItems.map((item) => ({
      id: item.id,
      src: item.url,
      alt: item.alt,
      caption: item.alt || 'Gallery image',
      colSpan: 'lg:col-span-1',
      rowSpan: '',
      aspectClass: 'aspect-[4/3]',
    }));
  }, [galleryItems]);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0
    );
  }, [galleryImages.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : 0));
  }, [galleryImages.length]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      ref={ref}
      className="py-20 lg:py-28 px-6 lg:px-10 bg-background"
      aria-label="Villa photo gallery"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="accent-rule" />
              <span className="label-caps text-muted-foreground">Gallery</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="section-headline text-foreground"
            >
              See It to Believe It
            </motion.h2>
          </div>
          <motion.a
            href="#contact"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-2 label-caps text-primary border-b border-accent pb-1 hover:text-accent transition-colors duration-300 whitespace-nowrap self-start md:self-auto"
          >
            Inquire About Availability
          </motion.a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              className="gallery-item relative overflow-hidden rounded-xl cursor-pointer aspect-[4/3]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              aria-label={`View ${img.caption} in lightbox`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openLightbox(i);
              }}
            >
              <AppImage
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />

              <div className="gallery-overlay absolute inset-0 flex flex-col justify-end p-5">
                <div className="flex items-center justify-between">
                  <span className="label-caps text-white/90">{img.caption}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ZoomIn size={14} className="text-white" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.995 }}>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3 shadow-lg border border-transparent hover:shadow-xl transition-shadow duration-300"
                aria-label="Explore more like that"
              >
                <span className="font-medium">Explore more like that</span>
                <motion.span
                  className="text-muted-foreground"
                  initial={{ x: 0 }}
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                >
                  <ChevronRight size={18} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
            <motion.div
              key={lightboxIndex}
              className="relative w-full max-w-5xl max-h-[85vh] mx-6"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] w-full">
                <AppImage
                  src={galleryImages[lightboxIndex].src}
                  alt={galleryImages[lightboxIndex].alt}
                  fill
                  priority
                  sizes="95vw"
                  className="object-contain rounded-lg"
                />
              </div>
              <p className="text-center mt-4 label-caps text-white/50">
                {galleryImages[lightboxIndex].caption} · {lightboxIndex + 1} /{' '}
                {galleryImages.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
