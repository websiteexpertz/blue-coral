'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Waves, UtensilsCrossed, ShoppingBag, Anchor, Sun } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useSiteMedia } from '@/app/components/media/useSiteMedia';
import { useSiteContent } from '@/app/components/site/useSiteContent';

const attractionIcons = [Waves, UtensilsCrossed, ShoppingBag, Anchor, Sun];

export default function NearbyAttractionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { getItem, getItemByKey } = useSiteMedia();
  const { content } = useSiteContent();
  const attractions = content.location.cards.map((item, index) => ({
    id: `attraction-${index}`,
    icon: attractionIcons[index % attractionIcons.length],
    title: item.title,
    description: item.description,
    tag: item.tag,
    src: item.src,
    key: item.key,
    alt: item.alt,
  }));

  return (
    <section
      id="location"
      ref={ref}
      className="py-20 lg:py-28 px-6 lg:px-10 bg-secondary"
      aria-label="Nearby attractions and location highlights"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="accent-rule" />
            <span className="label-caps text-muted-foreground">{content.location.eyebrow}</span>
            <div className="accent-rule" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="section-headline text-foreground mb-4"
          >
            {content.location.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed"
          >
            {content.location.description}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {attractions?.map((item, i) => {
            const Icon = item?.icon;
            return (
              <motion.div
                key={item?.id}
                className={`attraction-card group ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-video">
                  <AppImage
                    src={item.src || getItemByKey(item.key as string, item.src)}
                    alt={item?.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute top-3 left-3">
                    <span className="bg-card/90 backdrop-blur-sm border border-border text-foreground px-3 py-1 rounded-full label-caps text-[9px]">
                      {item?.tag}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon size={16} className="text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-lg font-light text-foreground">{item?.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item?.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 space-y-5"
        >
          <div>
            <h3 className="font-serif text-xl font-light text-foreground mb-3">
              {content.location.listTitle}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {content.location.listItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-light text-foreground mb-3">Restaurants</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(content.nearbyAttractions.restaurants ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 bg-card border border-border rounded-2xl overflow-hidden"
          aria-label="Map location placeholder"
        >
          <div className="relative aspect-[21/7] min-h-[200px] overflow-hidden">
            <AppImage
              src={
                content.location.mapImageSrc ||
                getItemByKey(content.location.mapImageKey, getItem('nearby-map', '/21.jpg'))
              }
              alt="Aerial satellite view of Great Guana Cay, Bahamas showing turquoise waters and island geography"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-8 py-5 text-center shadow-xl">
                <p className="font-serif text-xl font-light text-foreground mb-1">
                  {content.location.mapTitle}
                </p>
                <p className="label-caps text-muted-foreground">{content.location.mapSubtitle}</p>
                <a
                  href={content.location.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 label-caps text-primary hover:text-accent transition-colors duration-300"
                >
                  Open in Google Maps
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M1 11L11 1M11 1H4M11 1v7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
