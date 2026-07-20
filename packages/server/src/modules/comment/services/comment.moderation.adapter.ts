import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import * as commentRepository from '../comment.repository.js';

export const commentModerationAdapter: ModerationContentAdapter = {
  contentType: 'comment',
  contentModel: 'Comment',
  async lookup(contentId) {
    const comment = await commentRepository.findById(contentId);
    if (!comment || comment.deletedAt) return { exists: false, ownerId: null };

    return { exists: true, ownerId: getOwnerId(comment.userId) };
  },
  setModerationStatus(contentId, status) {
    return commentRepository.setModerationStatus(contentId, status);
  },
};
