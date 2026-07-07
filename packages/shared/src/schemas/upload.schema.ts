import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import { MULTIPART_MEDIA_TYPES } from '../constants/upload.constants.js';

const sessionIdSchema = z
  .string()
  .trim()
  .min(1, { message: 'Session ID is required.' })
  .max(128, { message: 'Session ID is too long.' });

const storageKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(512, { message: 'storageKey is too long.' });

const partNumberSchema = z
  .number()
  .int()
  .positive({ message: 'partNumber must be a positive integer.' });

const etagSchema = z.string().trim().min(1, { message: 'ETag is required.' });

export const initiateMultipartUploadSchema = z.object({
  mediaType: z.enum(MULTIPART_MEDIA_TYPES, {
    message: 'Invalid media type for multipart upload.',
  }),

  fileName: z
    .string()
    .trim()
    .min(1, { message: 'File name is required.' })
    .max(255, { message: 'File name is too long.' }),

  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: 'File size must be a positive number.' }),

  mimeType: z.string().trim().min(1, { message: 'mimeType is required.' }),

  fingerprint: z
    .string()
    .trim()
    .min(1, { message: 'File fingerprint is required.' })
    .max(255, { message: 'File fingerprint is too long.' }),

  durationSeconds: z.number().int().positive().optional(),
});

export const resumeMultipartUploadSchema = z.object({
  fingerprint: z
    .string()
    .trim()
    .min(1, { message: 'File fingerprint is required.' })
    .max(255, { message: 'File fingerprint is too long.' }),
});

export const multipartSessionIdParamSchema = z.object({
  sessionId: sessionIdSchema,
});

export const presignPartParamSchema = z.object({
  sessionId: sessionIdSchema,
  partNumber: z.coerce.number().int().positive(),
});

const completedPartSchema = z.object({
  partNumber: partNumberSchema,
  etag: etagSchema,
});

export const completeMultipartUploadSchema = z.object({
  parts: z
    .array(completedPartSchema)
    .min(1, { message: 'At least one uploaded part is required.' }),
});

export const abortMultipartUploadSchema = z.object({
  sessionId: sessionIdSchema,
});

export const completePartSchema = z.object({
  etag: etagSchema,
  size: z
    .number()
    .int()
    .positive({ message: 'size must be a positive integer.' }),
});

export const mediaIdParamSchema = z.object({
  mediaId: z.string().refine(isValidObjectId, {
    message: 'Invalid media ID.',
  }),
});
