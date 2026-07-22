import { z } from 'zod';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import { mongoIdSchema } from '../../core/contentRef/contentRef.schema.js';

export const notificationListQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const notificationIdParamSchema = z.object({
  notificationId: mongoIdSchema,
});

export const pushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const pushSubscriptionCreateSchema = z.object({
  endpoint: z.url(),
  keys: pushSubscriptionKeysSchema,
  userAgent: z.string().optional(),
});

export const pushSubscriptionDeleteSchema = z.object({
  endpoint: z.url(),
});
