import type { IPost, PostStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdatePostData = Omit<
  Partial<IPost>,
  'deletedAt' | 'unlistedAt' | 'unlistedExpiryWarnedAt'
> & {
  deletedAt?: Date | null;
  unlistedAt?: Date | null;
  unlistedExpiryWarnedAt?: Date | null;
};

export interface WebhookUpdateData {
  status: PostStatus;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
