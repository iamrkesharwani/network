import type { IVideo, VideoStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdateVideoData = Omit<
  Partial<IVideo>,
  'deletedAt' | 'unlistedAt' | 'unlistedExpiryWarnedAt'
> & {
  deletedAt?: Date | null;
  unlistedAt?: Date | null;
  unlistedExpiryWarnedAt?: Date | null;
};

export interface NewCaptionData {
  language: string;
  label: string;
  url: string;
  storageKey: string;
  isDefault: boolean;
}

export interface WebhookUpdateData {
  status: VideoStatus;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
