import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import * as postRepository from '../post.repository.js';

export const postModerationAdapter: ModerationContentAdapter = {
  contentType: 'post',
  contentModel: 'Post',
  async lookup(contentId) {
    const post = await postRepository.findById(contentId);
    if (!post) return { exists: false, ownerId: null };

    return { exists: true, ownerId: getOwnerId(post.userId) };
  },
  setModerationStatus(contentId, status) {
    return postRepository.setModerationStatus(contentId, status);
  },
};
