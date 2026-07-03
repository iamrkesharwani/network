import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as creatorController from './creator.controller.js';

const router = Router();

router.get('/me', requireAuth, creatorController.getMyProfile);
router.get('/catalog', creatorController.getCatalog);

export default router;
