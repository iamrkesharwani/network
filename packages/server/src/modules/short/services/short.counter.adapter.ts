import type { ContentCounterAdapter } from '../../../core/contentRef/contentCounter.types.js';
import * as shortRepository from '../short.repository.js';

export const shortCounterAdapter: ContentCounterAdapter = {
  contentType: 'short',
  async incrementLikes(contentId) {
    const doc = await shortRepository.incrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async decrementLikes(contentId) {
    const doc = await shortRepository.decrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async incrementComments(contentId) {
    const doc = await shortRepository.incrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async decrementComments(contentId) {
    const doc = await shortRepository.decrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async incrementShares(contentId) {
    const doc = await shortRepository.incrementShares(contentId);
    return doc?.shares ?? 0;
  },
};
