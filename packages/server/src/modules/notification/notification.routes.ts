import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import {
  notificationListQuerySchema,
  notificationIdParamSchema,
  pushSubscriptionCreateSchema,
  pushSubscriptionDeleteSchema,
} from '@network/shared';
import * as notificationController from './notification.controller.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  validate({ query: notificationListQuerySchema }),
  notificationController.list
);

router.get('/unread-count', requireAuth, notificationController.unreadCount);

router.patch(
  '/read-all',
  requireAuth,
  notificationController.markAllAsRead
);

router.patch(
  '/:notificationId/read',
  requireAuth,
  validate({ params: notificationIdParamSchema }),
  notificationController.markAsRead
);

router.post(
  '/push-subscriptions',
  requireAuth,
  validate({ body: pushSubscriptionCreateSchema }),
  notificationController.createPushSubscription
);

router.delete(
  '/push-subscriptions',
  requireAuth,
  validate({ body: pushSubscriptionDeleteSchema }),
  notificationController.deletePushSubscription
);

export default router;
