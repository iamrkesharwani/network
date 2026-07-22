import type { Request, Response } from 'express';
import type {
  NotificationListQuery,
  NotificationIdParam,
  PushSubscriptionCreateInput,
  PushSubscriptionDeleteInput,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import * as notificationService from './notification.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = req.query as unknown as NotificationListQuery;
  const result = await notificationService.listNotifications(
    req.user.id,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Notifications fetched successfully'
      )
    );
});

export const unreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const count = await notificationService.getUnreadCount(req.user.id);

    res
      .status(200)
      .json(new ApiResponse({ count }, 'Unread count fetched successfully'));
  }
);

export const markAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { notificationId } = req.params as unknown as NotificationIdParam;
    await notificationService.markAsRead(notificationId, req.user.id);

    res.status(200).json(new ApiResponse(null, 'Notification marked as read'));
  }
);

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await notificationService.markAllAsRead(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(null, 'All notifications marked as read'));
  }
);

export const createPushSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const input = req.body as PushSubscriptionCreateInput;
    await notificationService.savePushSubscription(req.user.id, input);

    res.status(200).json(new ApiResponse(null, 'Push subscription saved'));
  }
);

export const deletePushSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { endpoint } = req.body as PushSubscriptionDeleteInput;
    await notificationService.removePushSubscription(endpoint);

    res.status(200).json(new ApiResponse(null, 'Push subscription removed'));
  }
);
