'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

interface BulkMediaUploaderProps {
  onSelect: (files: File[], dataUrls: string[]) => Promise<void>;
  label?: string;
  accept?: string;
  disabled?: boolean;
  maxFiles?: number;
}

const compressImage = async (file: File) => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The selected file is not a valid image.'));
    img.src = dataUrl;
  });

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.max(400, Math.round(image.width * scale));
  const height = Math.max(400, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to prepare image preview.');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/webp', 0.8);
};

export default function BulkMediaUploader({
  onSelect,
  label = 'Upload gallery batch',
  accept = 'image/jpeg,image/png,image/webp',
  disabled = false,
  maxFiles = 20,
}: BulkMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    if (files.length > maxFiles) {
      setError(`Please select no more than ${maxFiles} images at a time.`);
      event.target.value = '';
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(5);

    try {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFile = files.find((file) => !allowed.includes(file.type));
      if (invalidFile) {
        throw new Error('Only JPG, PNG, and WEBP files are supported.');
      }

      const tooLargeFile = files.find((file) => file.size > 4 * 1024 * 1024);
      if (tooLargeFile) {
        throw new Error('Please choose images smaller than 4MB each.');
      }

      const dataUrls: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        setUploadProgress(Math.round(((index + 1) / files.length) * 90) + 5);
        const dataUrl = await compressImage(files[index]);
        dataUrls.push(dataUrl);
      }

      setUploadProgress(100);
      await onSelect(files, dataUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload selected images.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        {isUploading ? 'Uploading...' : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
