import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import { conversationLimiter } from '../../../core/middleware/rateLimit.middleware.js';
import {
  directConversationCreateSchema,
  groupConversationCreateSchema,
  groupUpdateSchema,
  participantAddSchema,
  conversationListQuerySchema,
  conversationIdParamSchema,
} from '@network/shared';
import * as conversationController from '../controllers/conversation.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  validate({ query: conversationListQuerySchema }),
  conversationController.list
);

router.post(
  '/direct',
  requireAuth,
  conversationLimiter,
  validate({ body: directConversationCreateSchema }),
  conversationController.createDirect
);

router.post(
  '/group',
  requireAuth,
  conversationLimiter,
  validate({ body: groupConversationCreateSchema }),
  conversationController.createGroup
);

router.post(
  '/:conversationId/participants',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema, body: participantAddSchema }),
  conversationController.addParticipants
);

router.patch(
  '/:conversationId',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema, body: groupUpdateSchema }),
  conversationController.updateGroupMeta
);

router.post(
  '/:conversationId/leave',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.leaveGroup
);

router.post(
  '/:conversationId/read',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.markRead
);

export default router;
