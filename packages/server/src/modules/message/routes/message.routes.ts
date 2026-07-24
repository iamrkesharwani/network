import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import { messageLimiter } from '../../../core/middleware/rateLimit.middleware.js';
import { uploadMessageAttachment } from '../../../core/middleware/upload.middleware.js';
import {
  messageSendSchema,
  messageDeleteSchema,
  messageReactionSetSchema,
  messageEditSchema,
  messageIdParamSchema,
  conversationIdParamSchema,
  messageListQuerySchema,
  messageSearchQuerySchema,
} from '@network/shared';
import * as messageController from '../controllers/message.controller.js';
import * as messageAttachmentController from '../controllers/messageAttachment.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  messageLimiter,
  validate({ body: messageSendSchema }),
  messageController.send
);

router.post(
  '/attachments/upload',
  requireAuth,
  messageLimiter,
  uploadMessageAttachment,
  messageAttachmentController.upload
);

router.get(
  '/single/:messageId',
  requireAuth,
  validate({ params: messageIdParamSchema }),
  messageController.getById
);

router.get(
  '/:messageId/attachment',
  requireAuth,
  validate({ params: messageIdParamSchema }),
  messageController.getAttachment
);

router.get(
  '/:conversationId/search',
  requireAuth,
  validate({ params: conversationIdParamSchema, query: messageSearchQuerySchema }),
  messageController.search
);

router.get(
  '/:conversationId',
  requireAuth,
  validate({ params: conversationIdParamSchema, query: messageListQuerySchema }),
  messageController.list
);

router.patch(
  '/:messageId',
  requireAuth,
  messageLimiter,
  validate({ params: messageIdParamSchema, body: messageEditSchema }),
  messageController.edit
);

router.delete(
  '/:messageId',
  requireAuth,
  messageLimiter,
  validate({ params: messageIdParamSchema, body: messageDeleteSchema }),
  messageController.remove
);

router.put(
  '/:messageId/reactions',
  requireAuth,
  messageLimiter,
  validate({ params: messageIdParamSchema, body: messageReactionSetSchema }),
  messageController.setReaction
);

router.delete(
  '/:messageId/reactions',
  requireAuth,
  messageLimiter,
  validate({ params: messageIdParamSchema }),
  messageController.removeReaction
);

export default router;
