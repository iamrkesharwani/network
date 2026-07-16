import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth } from '../../core/middleware/auth.middleware.js';
import { preferencesPatchSchema } from '@network/shared';
import {
  getPreferences,
  patchPreferences,
} from './controllers/preferences.controller.js';

const router = Router();

router.get('/', requireAuth, getPreferences);
router.patch(
  '/',
  requireAuth,
  validate({ body: preferencesPatchSchema }),
  patchPreferences
);

export default router;
