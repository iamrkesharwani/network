import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import * as conversationRepository from '../repository/conversation.repository.js';

export const conversationModerationAdapter: ModerationContentAdapter = {
  contentType: 'conversation',
  contentModel: 'Conversation',
  async lookup(contentId) {
    const conversation = await conversationRepository.findById(contentId);
    if (!conversation) return { exists: false, ownerId: null };

    // Direct conversations are inherently two-party and symmetric - neither
    // side "owns" it, so both must always be able to report it. Only groups
    // have a meaningful creator to exempt from reporting their own group.
    return {
      exists: true,
      ownerId:
        conversation.type === 'group'
          ? conversation.createdBy.toString()
          : null,
    };
  },
  async setModerationStatus(contentId, status) {
    const isLocked = status === 'jury_removed' || status === 'admin_removed';
    await conversationRepository.setModeratorLocked(contentId, isLocked);
  },
};
