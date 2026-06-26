import type { IVideo, VideoStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdateVideoData = Partial<IVideo>;

export interface WebhookUpdateData {
  status: VideoStatus;
  duration?: number;
  playbackUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
