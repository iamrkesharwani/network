import type { VideoStatus } from './video.types.js';
import type { ShortStatus } from './short.types.js';

export interface IMediaStatusEvent {
  mediaType: 'video' | 'short';
  id: string;
  title: string;
  status: VideoStatus | ShortStatus;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  errorMessage?: string;
}
