import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import videoRoutes from '../modules/video/video.routes.js';
import shortRoutes from '../modules/short/short.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/shorts', shortRoutes);

export default router;
