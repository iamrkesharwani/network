import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_SIZE_BYTES } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { useUploadAvatarMutation } from '../settingsApi';

interface AvatarEditorProps {
  currentAvatarUrl?: string;
  name: string;
}

const AvatarEditor = ({ currentAvatarUrl, name }: AvatarEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
      )
    ) {
      setError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Image is too large. Max size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await uploadAvatar(formData).unwrap();
    } catch {
      setError("Couldn't upload that image. Please try again.");
    }
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_AVATAR_MIME_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => !isLoading && inputRef.current?.click()}
        className="relative shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Change avatar"
      >
        <Avatar src={currentAvatarUrl} fallback={name} size="lg" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </button>

      <div>
        <button
          type="button"
          onClick={() => !isLoading && inputRef.current?.click()}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ImagePlus className="h-4 w-4" />
          Change photo
        </button>
        {error && (
          <p role="alert" className="mt-1 text-[0.72rem] text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AvatarEditor;
