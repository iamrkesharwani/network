import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import videoRoutes from './modules/video/video.routes.js';
import shortRoutes from './modules/short/short.routes.js';
import postRoutes from './modules/post/post.routes.js';
import creatorRoutes from './modules/creator/creator.routes.js';
import webhookRoutes from './modules/webhook/webhook.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/video', videoRoutes);
router.use('/short', shortRoutes);
router.use('/post', postRoutes);
router.use('/creator', creatorRoutes);
router.use('/webhook', webhookRoutes);
router.use('/uploads', uploadRoutes);

export default router;
