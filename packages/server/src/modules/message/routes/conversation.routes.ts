import { Router } from 'express';
import { validate } from '../../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../../core/middleware/auth.middleware.js';
import { conversationLimiter, uploadLimiter } from '../../../core/middleware/rateLimit.middleware.js';
import { uploadGroupAvatar as uploadGroupAvatarMiddleware } from '../../../core/middleware/upload.middleware.js';
import {
  directConversationCreateSchema,
  groupConversationCreateSchema,
  groupUpdateSchema,
  participantAddSchema,
  conversationListQuerySchema,
  conversationSearchQuerySchema,
  conversationIdParamSchema,
  conversationMuteSchema,
  conversationDisappearingTtlSchema,
} from '@network/shared';
import * as conversationController from '../controllers/conversation.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  validate({ query: conversationListQuerySchema }),
  conversationController.list
);

router.get(
  '/archived',
  requireAuth,
  validate({ query: conversationListQuerySchema }),
  conversationController.listArchived
);

router.get(
  '/search',
  requireAuth,
  validate({ query: conversationSearchQuerySchema }),
  conversationController.search
);

router.post(
  '/mark-all-read',
  requireAuth,
  conversationLimiter,
  conversationController.markAllAsRead
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
  '/:conversationId/avatar',
  requireAuth,
  uploadLimiter,
  validate({ params: conversationIdParamSchema }),
  uploadGroupAvatarMiddleware,
  conversationController.uploadGroupAvatar
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

router.post(
  '/:conversationId/mute',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema, body: conversationMuteSchema }),
  conversationController.muteConversation
);

router.post(
  '/:conversationId/unmute',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.unmuteConversation
);

router.post(
  '/:conversationId/archive',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.archiveConversation
);

router.post(
  '/:conversationId/unarchive',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.unarchiveConversation
);

router.post(
  '/:conversationId/delete',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.deleteConversation
);

router.post(
  '/:conversationId/undelete',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.undeleteConversation
);

router.post(
  '/:conversationId/pin',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.pinConversation
);

router.post(
  '/:conversationId/unpin',
  requireAuth,
  conversationLimiter,
  validate({ params: conversationIdParamSchema }),
  conversationController.unpinConversation
);

router.post(
  '/:conversationId/disappearing',
  requireAuth,
  conversationLimiter,
  validate({
    params: conversationIdParamSchema,
    body: conversationDisappearingTtlSchema,
  }),
  conversationController.setDisappearingMessagesTtl
);

export default router;
