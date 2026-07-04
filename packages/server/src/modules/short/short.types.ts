import type { IShort, ShortStatus } from '@network/shared';
import type { Request } from 'express';

export type UpdateShortData = Partial<IShort>;

export interface WebhookUpdateData {
  status: ShortStatus;
  duration?: number;
  playbackUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export type Requester = NonNullable<Request['user']>;
