import { z } from 'zod';
import {
  captionUploadSchema,
  captionIdParamSchema,
} from './caption.schema.js';

export type CaptionUploadInput = z.infer<typeof captionUploadSchema>;
export type CaptionIdParam = z.infer<typeof captionIdParamSchema>;

export interface ICaptionTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  isDefault: boolean;
}
