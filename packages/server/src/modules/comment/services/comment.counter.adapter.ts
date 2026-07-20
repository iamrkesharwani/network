import type { ContentCounterAdapter } from '../../../core/contentRef/contentCounter.types.js';
import * as commentRepository from '../comment.repository.js';

export const commentCounterAdapter: ContentCounterAdapter = {
  contentType: 'comment',
  async incrementLikes(contentId) {
    const doc = await commentRepository.incrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async decrementLikes(contentId) {
    const doc = await commentRepository.decrementLikes(contentId);
    return doc?.likes ?? 0;
  },
};
