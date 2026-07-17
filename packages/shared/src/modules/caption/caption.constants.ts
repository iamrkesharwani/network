export const ALLOWED_CAPTION_MIME_TYPES = ['text/vtt'] as const;
export const MAX_CAPTION_SIZE_BYTES = 512 * 1024;
export const CAPTION_KEY_PREFIX = 'captions';
export const MAX_CAPTIONS_PER_VIDEO = 20;
export const CAPTION_LABEL_MAX_LENGTH = 50;

export const CAPTION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ur', label: 'Urdu' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
] as const;

export const CAPTION_LANGUAGE_CODES = CAPTION_LANGUAGES.map(
  (language) => language.code
) as [(typeof CAPTION_LANGUAGES)[number]['code'], ...string[]];
