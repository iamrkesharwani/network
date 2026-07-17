import type { VideoStatus } from '../../modules/video/video.types.js';
import type { ShortStatus } from '../../modules/short/short.types.js';
import type { PostStatus } from '../../modules/post/post.types.js';

export interface IMediaStatusEvent {
  mediaType: 'video' | 'short' | 'post';
  id: string;
  title?: string;
  status: VideoStatus | ShortStatus | PostStatus;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  errorMessage?: string;
  progress?: number;
}

export interface IUnlistedExpiryWarningEvent {
  mediaType: 'video' | 'short' | 'post';
  id: string;
  title?: string;
  daysLeft: number;
}
