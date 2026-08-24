'use client';

import React from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

interface ImagePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  alt?: string;
  label?: string;
  placeholder?: string;
}

export default function ImagePicker({
  value,
  onChange,
  onRemove,
  alt = 'Media item',
  label = 'Image',
  placeholder = 'No image selected',
}: ImagePickerProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {value ? (
          <button type="button" onClick={onRemove} className="text-sm text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
          <AppImage
            src={value}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
        <span>Use the uploader below to set the image URL.</span>
      </div>
      {onChange ? (
        <input
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-2xl border border-border px-3 py-2 text-sm text-foreground"
        />
      ) : null}
    </div>
  );
}
