import { Router } from 'express';
import { validate } from '../../core/middleware/validate.middleware.js';
import { requireAuth, optionalAuth } from '../../core/middleware/auth.middleware.js';
import { searchLimiter } from '../../core/middleware/rateLimit.middleware.js';
import {
  searchAllQuerySchema,
  searchByTypeQuerySchema,
  searchCreatorsQuerySchema,
  searchSuggestionsQuerySchema,
  searchTypeParamSchema,
  recentSearchAddSchema,
  recentSearchRemoveQuerySchema,
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
  optionalAuth,
  validate({ query: searchCreatorsQuerySchema }),
  searchController.getSearchCreators
);

router.get(
  '/suggestions',
  optionalAuth,
  validate({ query: searchSuggestionsQuerySchema }),
  searchController.getSearchSuggestions
);

router.get('/recent', requireAuth, searchController.getRecentSearches);

router.post(
  '/recent',
  requireAuth,
  validate({ body: recentSearchAddSchema }),
  searchController.addRecentSearch
);

router.delete(
  '/recent',
  requireAuth,
  validate({ query: recentSearchRemoveQuerySchema }),
  searchController.removeRecentSearch
);

router.get(
  '/:type',
  validate({ params: searchTypeParamSchema, query: searchByTypeQuerySchema }),
  searchController.getSearchByType
);

export default router;
