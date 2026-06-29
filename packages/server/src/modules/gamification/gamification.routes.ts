import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as gamificationController from './controllers/gamification.controller.js';

const router = Router();

router.get('/me', requireAuth, gamificationController.getMyProfile);
router.get('/catalog', gamificationController.getCatalog);

export default router;
