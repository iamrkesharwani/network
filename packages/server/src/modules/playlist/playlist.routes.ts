import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import {
  playlistLimiter,
  uploadLimiter,
} from '../../core/middleware/rateLimit.middleware.js';
import { uploadPlaylistCover } from '../../core/middleware/upload.middleware.js';
import {
  playlistCreateSchema,
  playlistUpdateSchema,
  playlistIdParamSchema,
  playlistItemAddSchema,
  playlistItemIdParamSchema,
  playlistReorderSchema,
  playlistFeedQuerySchema,
  playlistItemsQuerySchema,
  playlistContainingQuerySchema,
  usernameParamSchema,
} from '@network/shared';
import * as playlistController from './controllers/playlist.controller.js';

const router = Router();

router.get(
  '/containing',
  requireAuth,
  validate({ query: playlistContainingQuerySchema }),
  playlistController.getContaining
);

router.post(
  '/',
  requireAuth,
  playlistLimiter,
  validate({ body: playlistCreateSchema }),
  playlistController.create
);

router.get(
  '/',
  requireAuth,
  validate({ query: playlistFeedQuerySchema }),
  playlistController.list
);

router.get(
  '/user/:username',
  optionalAuth,
  validate({ params: usernameParamSchema, query: playlistFeedQuerySchema }),
  playlistController.getByUsername
);

router.get(
  '/:playlistId',
  optionalAuth,
  validate({ params: playlistIdParamSchema }),
  playlistController.getOne
);

router.patch(
  '/:playlistId',
  requireAuth,
  playlistLimiter,
  validate({ params: playlistIdParamSchema, body: playlistUpdateSchema }),
  playlistController.update
);

router.delete(
  '/:playlistId',
  requireAuth,
  validate({ params: playlistIdParamSchema }),
  playlistController.remove
);

router.get(
  '/:playlistId/items',
  validate({ params: playlistIdParamSchema, query: playlistItemsQuerySchema }),
  playlistController.listItems
);

router.post(
  '/:playlistId/items',
  requireAuth,
  playlistLimiter,
  validate({ params: playlistIdParamSchema, body: playlistItemAddSchema }),
  playlistController.addItem
);

router.delete(
  '/:playlistId/items/:itemId',
  requireAuth,
  validate({ params: playlistItemIdParamSchema }),
  playlistController.removeItem
);

router.patch(
  '/:playlistId/reorder',
  requireAuth,
  playlistLimiter,
  validate({ params: playlistIdParamSchema, body: playlistReorderSchema }),
  playlistController.reorder
);

router.post(
  '/:playlistId/cover',
  requireAuth,
  uploadLimiter,
  validate({ params: playlistIdParamSchema }),
  uploadPlaylistCover,
  playlistController.uploadCover
);

router.delete(
  '/:playlistId/cover',
  requireAuth,
  validate({ params: playlistIdParamSchema }),
  playlistController.removeCover
);

export default router;
