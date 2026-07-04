import { Router } from 'express';
import { webhookLimiter } from '../../middleware/rateLimit.middleware.js';
import { handleMediaWebhook } from './webhook.controller.js';

const router = Router();

router.post('/media', webhookLimiter, handleMediaWebhook);

export default router;
