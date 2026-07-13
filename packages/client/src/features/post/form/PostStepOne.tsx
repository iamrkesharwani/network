import { Plus, X } from 'lucide-react';
import { MAX_POST_IMAGES, POST_TEXT_MAX_LENGTH } from '@network/shared';
import FloatingTextarea from '../../upload/components/FloatingTextarea';

interface PostStepOneProps {
  text: string;
  setText: (text: string) => void;
  images: File[];
  previewUrls: string[];
  attachmentError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  acceptedMime: string;
  onFilesSelected: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onContinue: () => void;
  disabled: boolean;
}

const PostStepOne = ({
  text,
  setText,
  images,
  previewUrls,
  attachmentError,
  fileInputRef,
  acceptedMime,
  onFilesSelected,
  onRemoveImage,
  onContinue,
  disabled,
}: PostStepOneProps) => {
  const canAddMore = images.length < MAX_POST_IMAGES;

  return (
    <div>
      <FloatingTextarea
        label="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={POST_TEXT_MAX_LENGTH}
        counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
        rows={4}
        disabled={disabled}
      />

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

        {images.length === 0 ? (
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
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-raised"
              >
                <img
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  disabled={disabled}
                  aria-label="Remove image"
                  className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border bg-surface-raised flex items-center justify-center text-text-muted hover:border-primary/40 hover:text-text-secondary transition-colors cursor-pointer"
                aria-label="Add more images"
              >
                <Plus className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

        {attachmentError && (
          <p role="alert" className="mt-2 text-sm text-error">
            {attachmentError}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="submit-btn relative w-full overflow-hidden rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
};

export default PostStepOne;
