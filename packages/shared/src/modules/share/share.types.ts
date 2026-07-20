import { z } from 'zod';
import { shareCreateSchema } from './share.schema.js';

export type ShareCreateInput = z.infer<typeof shareCreateSchema>;

export interface IShareResponse {
  url: string;
  ref: string;
}
