import { z } from 'zod';

export const PLAYLIST_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const playlistCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Playlist name must be at least 3 characters.' })
    .max(50, { message: 'Playlist name cannot exceed 50 characters.' }),

  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional(),

  visibility: z
    .enum(PLAYLIST_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const playlistUpdateSchema = playlistCreateSchema.partial();

export const playlistItemSchema = z
  .object({
    videoId: z.string().min(1, { message: 'Video ID is invalid.' }).optional(),
    shortId: z.string().min(1, { message: 'Short ID is invalid.' }).optional(),
  })
  .refine((data) => data.videoId || data.shortId, {
    message:
      'Must provide either a Video ID or a Short ID to add to the playlist.',
  });
