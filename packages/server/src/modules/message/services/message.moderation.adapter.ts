import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import * as messageRepository from '../repository/message.repository.js';

export const messageModerationAdapter: ModerationContentAdapter = {
  contentType: 'message',
  contentModel: 'Message',
  async lookup(contentId) {
    const message = await messageRepository.findById(contentId);
    if (!message) return { exists: false, ownerId: null };

    return { exists: true, ownerId: message.senderId.toString() };
  },
  async setModerationStatus(contentId, status) {
    if (status === 'jury_removed' || status === 'admin_removed') {
      await messageRepository.setModerationRemoved(contentId);
      return;
    }
    await messageRepository.clearModerationRemoved(contentId);
  },
};
