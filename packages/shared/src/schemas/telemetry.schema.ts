import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';

export const telemetryProgressSchema = z.object({
  videoId: z.string().refine(isValidObjectId, {
    message: 'Invalid video ID.',
  }),
  currentTime: z.number().min(0),
});
