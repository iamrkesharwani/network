import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MAX_POST_IMAGES } from '@network/shared';
import PostImagePreviewModal from './PostImagePreviewModal';

interface PostStepTwoProps {
  images: File[];
  previewUrls: string[];
  attachmentError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  acceptedMime: string;
  onFilesSelected: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
  disabled: boolean;
}

const PostStepTwo = ({
  images,
  previewUrls,
  attachmentError,
  fileInputRef,
  acceptedMime,
  onFilesSelected,
  onRemoveImage,
  onBack,
  onContinue,
  disabled,
}: PostStepTwoProps) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const hasImages = images.length > 0;
  const canAddMore = images.length < MAX_POST_IMAGES;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-text-secondary mb-2.5">
          Images{' '}
          <span className="text-text-muted font-normal">
            (optional, up to {MAX_POST_IMAGES})
          </span>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMime}
          multiple
          className="hidden"
          onChange={(e) => {
            onFilesSelected(e.target.files);
            e.target.value = '';
          }}
        />

        {hasImages && (
          <div
            className="mb-3 flex gap-2 overflow-x-auto py-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage:
                'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            }}
          >
            {previewUrls.map((url, index) => (
              <div key={url} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className="block h-16 w-16 overflow-hidden rounded-lg border border-border bg-surface-raised cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  disabled={disabled}
                  aria-label="Remove image"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!hasImages ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border bg-surface-raised py-10 flex flex-col items-center justify-center gap-2 text-text-muted hover:border-primary/40 hover:text-text-secondary transition-colors cursor-pointer"
          >
            <Plus className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-sm">Add images</span>
            <span className="text-xs">JPEG, PNG, WebP</span>
          </button>
        ) : (
          canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border bg-surface-raised py-3 flex items-center justify-center gap-2 text-text-muted hover:border-primary/40 hover:text-text-secondary transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">Add more</span>
            </button>
          )
        )}

        {attachmentError && (
          <p role="alert" className="mt-2 text-sm text-error">
            {attachmentError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:border-primary/40 transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-2 rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
        >
          Continue
        </button>
      </div>

      <PostImagePreviewModal
        isOpen={previewIndex !== null}
        imageUrl={previewIndex !== null ? previewUrls[previewIndex] : null}
        onClose={() => setPreviewIndex(null)}
      />
    </div>
  );
};

export default PostStepTwo;
