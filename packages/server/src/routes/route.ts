import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import videoRoutes from '../modules/video/video.routes.js';
import shortRoutes from '../modules/short/short.routes.js';
import gamificationRoutes from '../modules/gamification/gamification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/video', videoRoutes);
router.use('/short', shortRoutes);
router.use('/gamification', gamificationRoutes);

export default router;
