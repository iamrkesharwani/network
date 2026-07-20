import type { ContentCounterAdapter } from '../../../core/contentRef/contentCounter.types.js';
import * as videoRepository from '../video.repository.js';

export const videoCounterAdapter: ContentCounterAdapter = {
  contentType: 'video',
  async incrementLikes(contentId) {
    const doc = await videoRepository.incrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async decrementLikes(contentId) {
    const doc = await videoRepository.decrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async incrementComments(contentId) {
    const doc = await videoRepository.incrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async decrementComments(contentId) {
    const doc = await videoRepository.decrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async incrementShares(contentId) {
    const doc = await videoRepository.incrementShares(contentId);
    return doc?.shares ?? 0;
  },
};
