import type { ContentCounterAdapter } from '../../../core/contentRef/contentCounter.types.js';
import * as postRepository from '../post.repository.js';

export const postCounterAdapter: ContentCounterAdapter = {
  contentType: 'post',
  async incrementLikes(contentId) {
    const doc = await postRepository.incrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async decrementLikes(contentId) {
    const doc = await postRepository.decrementLikes(contentId);
    return doc?.likes ?? 0;
  },
  async incrementComments(contentId) {
    const doc = await postRepository.incrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async decrementComments(contentId) {
    const doc = await postRepository.decrementCommentsCount(contentId);
    return doc?.commentsCount ?? 0;
  },
  async incrementShares(contentId) {
    const doc = await postRepository.incrementShares(contentId);
    return doc?.shares ?? 0;
  },
};
