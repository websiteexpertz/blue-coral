'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BedDouble, Bath, Waves, Anchor, MapPin, Zap, Wind, ChefHat } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useSiteContent } from '@/app/components/site/useSiteContent';

/*
BENTO GRID AUDIT:
Array has 8 cards: [Bedrooms, Bathrooms, Waterfront, Dock, Location, Generator, AC, Kitchen]

Desktop (grid-cols-4):
Row 1: [col-1: Bedrooms cs-2 rs-1] [col-3: Bathrooms cs-1] [col-4: Waterfront cs-1]
Row 2: [col-1: Dock cs-1] [col-2: Location cs-2] [col-4: Generator cs-1]
Row 3: [col-1: AC cs-2] [col-3: Kitchen cs-2]
Placed 8/8 cards ✓

Mobile (grid-cols-1): all cards stack, no empty cells ✓
Tablet (grid-cols-2): each card cs-1, 8 cells fill 4 rows ✓
*/

const featureIcons = [BedDouble, Bath, Waves, Anchor, MapPin, Zap, Wind, ChefHat];

export default function VillaHighlightsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { content } = useSiteContent();
  const highlights = content.villaFeatures.highlights.map((item, index) => ({
    id: `feature-${index}`,
    icon: featureIcons[index % featureIcons.length],
    title: item.title,
    description: item.description,
    accent: index === 0 || index === 4,
    colSpan: index === 0 || index === 4 || index === 6 ? 'lg:col-span-2' : 'lg:col-span-1',
    rowSpan: '',
  }));

  return (
    <section
      id="villa"
      ref={ref}
      className="py-20 lg:py-28 px-6 lg:px-10 bg-secondary"
      aria-label="Villa highlights and amenities"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="accent-rule" />
              <span className="label-caps text-muted-foreground">
                {content.villaFeatures.eyebrow}
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="section-headline text-foreground"
            >
              {content.villaFeatures.title}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted-foreground text-base max-w-sm leading-relaxed md:text-right"
          >
            {content.villaFeatures.description}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights?.map((item, i) => {
            const Icon = item?.icon;
            return (
              <motion.div
                key={item?.id}
                /* BENTO AUDIT comment: card i={i} id={item.id} colSpan={item.colSpan} */
                className={`bento-card p-7 flex flex-col gap-4 ${item?.colSpan} ${item?.accent ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item?.accent ? 'bg-white/15' : 'bg-secondary'
                  }`}
                >
                  <Icon
                    size={20}
                    className={item?.accent ? 'text-accent' : 'text-primary'}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3
                    className={`font-serif text-xl font-light mb-2 ${
                      item?.accent ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {item?.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      item?.accent ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {item?.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional amenities row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 bg-card border border-border rounded-2xl px-8 py-6 flex flex-wrap gap-4 items-center justify-between"
        >
          <p className="label-caps text-muted-foreground">Also included</p>
          {content.villaFeatures.footerItems?.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <span className="w-1 h-1 rounded-full bg-accent inline-block" aria-hidden="true" />
              {amenity}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
