import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import videoRoutes from './modules/video/video.routes.js';
import shortRoutes from './modules/short/short.routes.js';
import creatorRoutes from './modules/creator/creator.routes.js';
import webhookRoutes from './modules/webhook/webhook.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/video', videoRoutes);
router.use('/short', shortRoutes);
router.use('/creator', creatorRoutes);
router.use('/webhook', webhookRoutes);

export default router;
