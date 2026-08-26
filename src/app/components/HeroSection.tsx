'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, 140]);
  const textY = useTransform(scrollY, [0, 700], [0, 60]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.45, 0.7]);

  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCursorPos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Layout is handled with CSS-only responsive techniques (clamp(), dvh, flexbox).
  // Avoid JS-based heading resizing or browser-zoom detection to prevent layout thrash.

  const lineVariants = {
    hidden: { y: '110%', opacity: 0 },
    visible: (i: number) => ({
      y: '0%',
      opacity: 1,
      transition: {
        duration: 1.1,
        delay: 0.3 + i * 0.18,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: 0.9 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      ref={containerRef as any}
      id="hero"
      className="relative w-full overflow-hidden flex items-center justify-center"
      aria-label="Hero section"
      style={{ minHeight: '100dvh' }}
    >
      {/* Background video with parallax */}
      <motion.div className="absolute inset-0 parallax-layer" style={{ y: imageY }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Atmospheric overlay — dark enough for white text */}
      <motion.div className="absolute inset-0" style={{ opacity: overlayOpacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </motion.div>

      {/* Subtle cursor-reactive light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${cursorPos.x * 100}% ${cursorPos.y * 100}%, rgba(201,169,110,0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full mx-auto px-6 lg:px-10 hero-grid"
        style={{ y: textY }}
      >
        <div className="hero-top">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            <div className="h-px bg-accent" style={{ width: 'clamp(2.5rem, 6vw, 3rem)' }} />
            <span
              className="label-caps text-white/70"
              style={{ fontSize: 'clamp(0.75rem, 0.9vw, 0.95rem)' }}
            >
              Great Guana Cay · Bahamas
            </span>
          </motion.div>
        </div>

        <div className="hero-center">
          <div>
            <h1
              className="hero-headline hero-heading text-white mb-2 font-serif font-light"
              aria-label="Where the Bahamas Reveals Its Most Beautiful Secret"
            >
              {['Where the Bahamas', 'Reveals Its Most', 'Beautiful Secret.'].map((line, i) => (
                <span key={i} className="line-reveal-wrapper block overflow-hidden">
                  <motion.span
                    className="block"
                    custom={i}
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {i === 2 ? (
                      <>
                        <em className="not-italic" style={{ color: 'var(--accent)' }}>
                          Beautiful
                        </em>{' '}
                        Secret.
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-white/70 font-light hero-sub"
            >
              Four-bedroom luxury villa overlooking Fisher&apos;s Bay. Private dock, waterfront
              porches, and the unhurried rhythm of island life.
            </motion.p>

            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 hero-ctas"
            >
              <Link
                href="#contact"
                className="luxury-btn-primary hero-cta flex items-center justify-center"
              >
                Book Your Stay
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#gallery"
                className="luxury-btn-outline hero-cta flex items-center justify-center"
              >
                Explore the Villa
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="hero-bottom">
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full mt-4"
          >
            <div style={{ width: '100%' }}>
              <div className="grid stats-grid">
                {[
                  { value: '4', label: 'Bedrooms' },
                  { value: '4', label: 'Bathrooms' },
                  { value: 'Direct', label: 'Waterfront' },
                  { value: '$650', label: 'From / Night' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="label-caps stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <style jsx>{`
          #hero .hero-grid {
            display: grid;
            grid-template-rows: auto 1fr auto;
            width: min(92%, 1400px);
            padding-block: clamp(0.8rem, 1.4vw, 1.5rem);
            gap: clamp(0.45rem, 0.8vw, 0.8rem);
          }
          #hero .hero-top {
            align-self: start;
          }
          #hero .hero-center {
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          #hero .hero-center > div {
            max-width: 780px;
          }
          #hero .hero-bottom {
            align-self: end;
          }

          /* Base fluid typography */
          #hero .hero-heading {
            font-size: clamp(1.65rem, 2.8vw, 2.4rem);
            line-height: 0.94;
            margin-bottom: 0.35rem;
          }
          #hero .hero-sub {
            font-size: clamp(0.8rem, 0.9vw, 0.95rem);
            max-width: 40rem;
            margin-bottom: 0.75rem;
          }
          #hero .hero-cta {
            font-size: clamp(0.72rem, 0.8vw, 0.88rem);
            padding: clamp(0.38rem, 0.7vw, 0.65rem) clamp(0.6rem, 0.95vw, 0.95rem);
          }
          #hero .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: clamp(0.35rem, 0.7vw, 0.6rem);
            display: grid;
            align-items: stretch;
          }
          #hero .stat-card {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: clamp(0.35rem, 0.65vw, 0.6rem);
            border-radius: 0.75rem;
          }
          #hero .stat-value {
            font-family: var(--font-serif, serif);
            font-size: clamp(0.9rem, 1.45vw, 1.15rem);
            font-weight: 300;
            color: white;
          }
          #hero .stat-label {
            color: rgba(255, 255, 255, 0.65);
            font-size: clamp(0.65rem, 0.75vw, 0.8rem);
            margin-top: 0.15rem;
          }

          /* Height-based responsiveness for browser zoom and short viewports */
          @media (max-height: 950px) {
            #hero .hero-grid {
              padding-block: clamp(1.8rem, 4.8vw, 5rem);
            }
          }
          @media (max-height: 900px) {
            #hero .hero-grid {
              padding-block: clamp(0.8rem, 2vw, 1.8rem);
              gap: clamp(0.45rem, 0.8vw, 0.9rem);
            }
            #hero .hero-heading {
              font-size: clamp(1.9rem, 3.2vw, 3rem) !important;
            }
            #hero .hero-sub {
              font-size: clamp(0.9rem, 0.9vw, 1rem) !important;
            }
            #hero .hero-cta {
              padding-inline: clamp(0.55rem, 1vw, 1rem) !important;
            }
            #hero .stat-card {
              padding: clamp(0.35rem, 0.7vw, 0.6rem);
            }
          }
          @media (max-height: 850px) {
            #hero .hero-grid {
              padding-block: clamp(0.7rem, 1.8vw, 1.6rem);
              gap: clamp(0.35rem, 0.7vw, 0.8rem);
            }
            #hero .hero-heading {
              font-size: clamp(1.75rem, 3vw, 2.7rem) !important;
            }
            #hero .hero-sub {
              font-size: clamp(0.85rem, 0.85vw, 0.95rem) !important;
            }
            #hero .hero-cta {
              padding-block: clamp(0.4rem, 0.75vw, 0.65rem) !important;
              padding-inline: clamp(0.5rem, 0.9vw, 0.9rem) !important;
            }
            #hero .stat-card {
              padding: clamp(0.3rem, 0.65vw, 0.55rem);
            }
          }
          @media (max-height: 800px) {
            #hero .hero-grid {
              padding-block: clamp(0.6rem, 1.6vw, 1.3rem);
              gap: clamp(0.3rem, 0.6vw, 0.7rem);
            }
            #hero .hero-heading {
              font-size: clamp(1.65rem, 2.8vw, 2.5rem) !important;
            }
            #hero .hero-sub {
              font-size: clamp(0.82rem, 0.8vw, 0.92rem) !important;
            }
            #hero .hero-cta {
              padding-block: clamp(0.35rem, 0.7vw, 0.55rem) !important;
              padding-inline: clamp(0.45rem, 0.8vw, 0.85rem) !important;
            }
            #hero .stat-card {
              padding: clamp(0.25rem, 0.55vw, 0.5rem);
            }
            #hero .stat-value {
              font-size: clamp(0.95rem, 1.5vw, 1.2rem) !important;
            }
          }
          @media (max-height: 750px) {
            #hero .hero-grid {
              padding-block: clamp(0.5rem, 1.2vw, 1rem);
              gap: clamp(0.25rem, 0.55vw, 0.6rem);
            }
            #hero .hero-heading {
              font-size: clamp(1.45rem, 2.6vw, 2.3rem) !important;
            }
            #hero .hero-sub {
              font-size: clamp(0.8rem, 0.8vw, 0.9rem) !important;
            }
            #hero .hero-cta {
              padding-block: clamp(0.3rem, 0.6vw, 0.45rem) !important;
              padding-inline: clamp(0.4rem, 0.7vw, 0.75rem) !important;
            }
            #hero .stat-card {
              padding: clamp(0.2rem, 0.5vw, 0.4rem);
            }
            #hero .stat-value {
              font-size: clamp(0.85rem, 1.3vw, 1.05rem) !important;
            }
          }
        `}</style>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="label-caps text-white/40 text-[9px]">Scroll</span>
        <ChevronDown size={16} className="text-white/40 scroll-indicator" />
      </motion.div>
    </section>
  );
}
