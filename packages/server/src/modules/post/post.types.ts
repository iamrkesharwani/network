import type { IPost } from '@network/shared';
import type { Request } from 'express';

export type UpdatePostData = Omit<
  Partial<IPost>,
  'deletedAt' | 'unlistedAt' | 'unlistedExpiryWarnedAt'
> & {
  deletedAt?: Date | null;
  unlistedAt?: Date | null;
  unlistedExpiryWarnedAt?: Date | null;
};

export type Requester = NonNullable<Request['user']>;
