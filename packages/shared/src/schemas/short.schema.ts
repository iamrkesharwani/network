import { z } from 'zod';

export const SHORT_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const shortUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),

  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional(),

  thumbnailUrl: z
    .url({ message: 'Thumbnail must be a valid URL.' })
    .startsWith('https://', { message: 'Thumbnail URL must use HTTPS.' }),

  streamId: z.string().min(1, { message: 'Cloudflare Stream ID is required.' }),

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
    .max(5, { message: 'Shorts can have a maximum of 5 tags.' })
    .optional()
    .default([]),

  visibility: z
    .enum(SHORT_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const shortUpdateSchema = shortUploadSchema
  .partial()
  .omit({ streamId: true });
