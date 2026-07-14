import { useRef, useState } from 'react';
import { Loader2, Star, Trash2, Upload } from 'lucide-react';
import {
  CAPTION_LANGUAGES,
  MAX_CAPTION_SIZE_BYTES,
  type ICaptionTrack,
} from '@network/shared';
import {
  useUploadCaptionMutation,
  useDeleteCaptionMutation,
  useSetDefaultCaptionMutation,
} from '../videoApi';

interface CaptionsManagerProps {
  videoId: string;
  captions: ICaptionTrack[];
}

const CaptionsManager = ({ videoId, captions }: CaptionsManagerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [uploadCaption, { isLoading: isUploading }] =
    useUploadCaptionMutation();
  const [deleteCaption, { isLoading: isDeleting }] =
    useDeleteCaptionMutation();
  const [setDefaultCaption] = useSetDefaultCaptionMutation();

  const takenLanguages = new Set(captions.map((caption) => caption.language));
  const availableLanguages = CAPTION_LANGUAGES.filter(
    (entry) => !takenLanguages.has(entry.code)
  );

  const handleFile = async (file: File) => {
    setError(null);

    if (!language) {
      setError('Choose a language first.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.vtt')) {
      setError('Please upload a .vtt file.');
      return;
    }
    if (file.size > MAX_CAPTION_SIZE_BYTES) {
      setError('File is too large.');
      return;
    }

    const firstLine = (await file.text()).trimStart().slice(0, 6);
    if (firstLine !== 'WEBVTT') {
      setError('This does not look like a valid WebVTT file.');
      return;
    }

    const formData = new FormData();
    formData.append('caption', file);
    formData.append('language', language);

    try {
      await uploadCaption({ videoId, formData }).unwrap();
      setLanguage('');
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      setError("Couldn't upload that caption. Please try again.");
    }
  };

  return (
    <div className="mb-6">
      <p className="mb-2.5 text-sm font-medium text-text-secondary">
        Captions
      </p>

      {captions.length > 0 && (
        <ul className="mb-3 space-y-2">
          {captions.map((caption) => (
            <li
              key={caption.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-raised px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                {caption.label}
                {caption.isDefault && (
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                    Default
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                {!caption.isDefault && (
                  <button
                    type="button"
                    onClick={() =>
                      setDefaultCaption({ videoId, captionId: caption.id })
                    }
                    aria-label={`Make ${caption.label} the default`}
                    className="rounded-full p-1.5 text-text-muted hover:bg-surface-overlay hover:text-primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    deleteCaption({ videoId, captionId: caption.id })
                  }
                  aria-label={`Delete ${caption.label} captions`}
                  className="rounded-full p-1.5 text-text-muted hover:bg-surface-overlay hover:text-error disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {availableLanguages.length > 0 ? (
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-border bg-surface-raised px-2.5 text-sm"
          >
            <option value="">Select language</option>
            {availableLanguages.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>

          <input
            ref={inputRef}
            type="file"
            accept=".vtt,text/vtt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <button
            type="button"
            disabled={!language || isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-text-secondary hover:border-primary/40 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload .vtt
          </button>
        </div>
      ) : (
        <p className="text-xs text-text-muted">
          All supported languages have a caption track.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CaptionsManager;
