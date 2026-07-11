import type { IShort, ShortStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdateShortData = Omit<
  Partial<IShort>,
  'deletedAt' | 'unlistedAt' | 'unlistedExpiryWarnedAt'
> & {
  deletedAt?: Date | null;
  unlistedAt?: Date | null;
  unlistedExpiryWarnedAt?: Date | null;
};

export interface WebhookUpdateData {
  status: ShortStatus;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
