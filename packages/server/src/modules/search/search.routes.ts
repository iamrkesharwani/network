import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { searchLimiter } from '../../core/middleware/rateLimit.middleware.js';
import {
  searchAllQuerySchema,
  searchByTypeQuerySchema,
  searchCreatorsQuerySchema,
  searchTypeParamSchema,
} from '@network/shared';
import * as searchController from './search.controller.js';

const router = Router();

router.use(searchLimiter);

router.get(
  '/',
  validate({ query: searchAllQuerySchema }),
  searchController.getSearchAll
);

router.get(
  '/creators',
  validate({ query: searchCreatorsQuerySchema }),
  searchController.getSearchCreators
);

router.get(
  '/:type',
  validate({ params: searchTypeParamSchema, query: searchByTypeQuerySchema }),
  searchController.getSearchByType
);

export default router;
