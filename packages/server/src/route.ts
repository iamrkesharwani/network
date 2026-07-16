import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import videoRoutes from './modules/video/video.routes.js';
import shortRoutes from './modules/short/short.routes.js';
import postRoutes from './modules/post/post.routes.js';
import creatorRoutes from './modules/creator/creator.routes.js';
import webhookRoutes from './modules/webhook/webhook.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import feedRoutes from './modules/feed/feed.routes.js';
import userRoutes from './modules/user/user.routes.js';
import preferencesRoutes from './modules/preferences/preferences.routes.js';
import accountRoutes from './modules/account/account.routes.js';
import historyRoutes from './modules/history/history.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import reportRoutes from './modules/report/report.routes.js';
import juryRoutes from './modules/jury/jury.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/video', videoRoutes);
router.use('/short', shortRoutes);
router.use('/post', postRoutes);
router.use('/creator', creatorRoutes);
router.use('/webhook', webhookRoutes);
router.use('/uploads', uploadRoutes);
router.use('/feed', feedRoutes);
router.use('/user', userRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/account', accountRoutes);
router.use('/history', historyRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);
router.use('/jury', juryRoutes);

export default router;
