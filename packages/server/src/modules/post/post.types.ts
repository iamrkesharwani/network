import type { IPost, PostStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdatePostData = Partial<IPost>;

export interface WebhookUpdateData {
  status: PostStatus;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
