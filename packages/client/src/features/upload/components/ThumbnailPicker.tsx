import { useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, X, Loader2, RefreshCw } from 'lucide-react';
import {
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface ThumbnailPickerProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  previewFallbackUrl?: string;
  uploadThumbnail: (file: File) => Promise<string>;
}

const ThumbnailPicker = ({
  value,
  onChange,
  previewFallbackUrl,
  uploadThumbnail,
}: ThumbnailPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);

    if (
      !ALLOWED_THUMBNAIL_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_THUMBNAIL_MIME_TYPES)[number]
      )
    ) {
      setError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      setError('Image is too large. Max size is 2MB.');
      return;
    }

    setIsLoading(true);
    try {
      const thumbnailUrl = await uploadThumbnail(file);
      onChange(thumbnailUrl);
    } catch {
      setError("Couldn't upload that image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const previewSrc = value ?? previewFallbackUrl;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_THUMBNAIL_MIME_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={cn(
          'relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition-colors flex items-center justify-center',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : 'border-border bg-surface-raised hover:border-primary/40'
        )}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Thumbnail preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted px-4 text-center">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">
              Drop an image or click to upload (optional)
            </span>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {previewSrc && !isLoading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </span>
          </div>
        )}

        {value && !isLoading && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="Remove custom thumbnail"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default ThumbnailPicker;
