import type { Request } from 'express';

export type Requester = NonNullable<Request['user']>;
