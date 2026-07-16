import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
} from '@network/shared';
import Avatar from '../../../../shared/ui/primitives/Avatar';
import { useUploadAvatarMutation } from '../../settingsApi';

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
    <div className="flex flex-col items-center">
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

      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => !isLoading && inputRef.current?.click()}
        className="group relative h-24 w-24 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        aria-label="Change avatar"
      >
        <Avatar
          src={currentAvatarUrl}
          fallback={name}
          className="h-24 w-24 text-2xl"
        />

        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-primary text-white">
          <Camera className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </motion.button>

      {error && (
        <p role="alert" className="mt-2 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default AvatarEditor;
