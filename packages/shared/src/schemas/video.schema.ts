import { z } from 'zod';

export const VIDEO_CATEGORIES = [
  'Gaming',
  'Education',
  'Technology',
  'Entertainment',
  'Music',
  'Sports',
  'News',
  'Travel',
  'Vlog',
] as const;

export const VIDEO_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const videoUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),

  description: z
    .string()
    .trim()
    .max(5000, { message: 'Description cannot exceed 5000 characters.' })
    .optional(),

  thumbnailUrl: z
    .string()
    .url({ message: 'Thumbnail must be a valid URL.' })
    .startsWith('https://', { message: 'Thumbnail URL must use HTTPS.' }),

  streamId: z.string().min(1, { message: 'Cloudflare Stream ID is required.' }),

  category: z.enum(VIDEO_CATEGORIES, {
    message: 'Invalid or missing category selected.',
  }),

  tags: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .min(2, { message: 'Tag must be at least 2 characters.' })
        .max(20, { message: 'Tag cannot exceed 20 characters.' })
        .regex(/^[a-z0-9]+$/, {
          message: 'Tags can only contain letters and numbers.',
        })
    )
    .max(10, { message: 'You can only add up to 10 tags.' })
    .optional()
    .default([]),

  visibility: z
    .enum(VIDEO_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const videoUpdateSchema = videoUploadSchema
  .partial()
  .omit({ streamId: true });
