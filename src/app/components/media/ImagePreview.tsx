'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';

interface ImagePreviewProps {
  src?: string;
  alt?: string;
  label?: string;
  className?: string;
}

export default function ImagePreview({
  src,
  alt = 'Preview image',
  label,
  className = '',
}: ImagePreviewProps) {
  if (!src) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground ${className}`}
      >
        No image selected
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30">
        <div className="relative aspect-video">
          <AppImage
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
