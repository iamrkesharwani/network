import { z } from 'zod';
import {
  shortUploadSchema,
  shortUpdateSchema,
  SHORT_VISIBILITY,
} from '../schemas/short.schema.js';

export type ShortUploadInput = z.infer<typeof shortUploadSchema>;
export type ShortUpdateInput = z.infer<typeof shortUpdateSchema>;
export type ShortVisibility = (typeof SHORT_VISIBILITY)[number];

export interface IShort {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  streamId: string;
  tags: string[];
  visibility: ShortVisibility;
  views: number;
  likes: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
