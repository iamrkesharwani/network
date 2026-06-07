import { z } from 'zod';
import {
  videoUpdateSchema,
  videoUploadSchema,
  VIDEO_CATEGORIES,
  VIDEO_VISIBILITY,
} from '../schemas/video.schema.js';

export type VideoUploadInput = z.infer<typeof videoUploadSchema>;
export type VideoUpdateInput = z.infer<typeof videoUpdateSchema>;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];
export type VideoVisibility = (typeof VIDEO_VISIBILITY)[number];

export interface IVideo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  streamId: string;
  category: VideoCategory;
  tags: string[];
  visibility: VideoVisibility;
  views: number;
  likes: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
