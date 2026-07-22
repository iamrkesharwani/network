import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import { messageLimiter } from '../../../core/middleware/rateLimit.middleware.js';
import {
  messageSendSchema,
  messageDeleteSchema,
  messageIdParamSchema,
  conversationIdParamSchema,
  messageListQuerySchema,
} from '@network/shared';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  messageLimiter,
  validate({ body: messageSendSchema }),
  messageController.send
);

router.get(
  '/:conversationId',
  requireAuth,
  validate({ params: conversationIdParamSchema, query: messageListQuerySchema }),
  messageController.list
);

router.delete(
  '/:messageId',
  requireAuth,
  messageLimiter,
  validate({ params: messageIdParamSchema, body: messageDeleteSchema }),
  messageController.remove
);

export default router;
