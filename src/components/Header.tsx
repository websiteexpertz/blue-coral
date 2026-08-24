'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useSiteMedia } from '@/app/components/media/useSiteMedia';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Villa', href: '#villa' },
  { label: 'Rates', href: '#rates' },
  { label: 'Location', href: '#location' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const pathname = usePathname();
  const { getItem } = useSiteMedia();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 glass-nav ${scrolled ? 'scrolled py-4' : 'py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Blue Coral Landing home"
          >
            <Image
              src={getItem('logo', '/logo.png')}
              alt="Blue Coral Landing logo"
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks?.map((link) => (
              <Link
                key={link?.href}
                href={link?.href}
                className={`nav-link-luxury transition-colors duration-300 ${pathname === '/gallery' ? 'text-foreground hover:text-primary' : scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/70 hover:text-white'}`}
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="#contact"
              className={`hidden md:inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-full transition-all duration-300 ${
                pathname === '/gallery'
                  ? 'bg-foreground text-background hover:bg-primary hover:text-white'
                  : scrolled
                    ? 'bg-primary text-white hover:bg-accent hover:text-foreground'
                    : 'bg-white/15 text-white border border-white/40 hover:bg-white/25'
              }`}
            >
              Inquire Now
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 mobile-menu-overlay flex flex-col pt-24 px-6 pb-10"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-1">
            {navLinks?.map((link, i) => (
              <Link
                key={link?.href}
                href={link?.href}
                onClick={handleNavClick}
                className="py-4 border-b border-border text-2xl font-serif font-light text-foreground hover:text-primary transition-colors duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link?.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8">
            <Link
              href="#contact"
              onClick={handleNavClick}
              className="luxury-btn-primary w-full justify-center text-center"
            >
              Inquire Now
            </Link>
            <p className="mt-4 text-center label-caps text-muted-foreground">
              From $650 / night · Great Guana Cay
            </p>
          </div>
        </div>
      )}
    </>
  );
}
