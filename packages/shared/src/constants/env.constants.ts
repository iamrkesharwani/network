export const STORAGE_PROVIDERS = [
  'r2',
  's3',
  'backblaze',
  'digitalocean',
  'bunny-storage',
  'azure',
] as const;
export const VIDEO_PROVIDERS = ['cloudflare', 'mux', 'bunny-stream'] as const;
export const IMAGE_PROVIDERS = ['cloudflare', 's3-cdn'] as const;
export const SEVEN_DAYS_MS = 604800000;