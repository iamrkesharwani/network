import { z } from 'zod';

export const commentCreateSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, { message: 'Comment cannot be empty.' })
      .max(2000, { message: 'Comment cannot exceed 2000 characters.' }),

    videoId: z.string().min(1, { message: 'Invalid Video ID.' }).optional(),
    shortId: z.string().min(1, { message: 'Invalid Short ID.' }).optional(),

    parentId: z.string().min(1, { message: 'Invalid Parent ID.' }).optional(),
  })
  .refine(
    (data) => (data.videoId || data.shortId) && !(data.videoId && data.shortId),
    {
      message:
        'A comment must belong to exactly one target (either a video or a short, not both).',
    }
  );

export const commentUpdateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: 'Comment cannot be empty.' })
    .max(2000, { message: 'Comment cannot exceed 2000 characters.' }),
});
