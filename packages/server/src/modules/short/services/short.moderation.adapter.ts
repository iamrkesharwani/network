import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import * as shortRepository from '../short.repository.js';

export const shortModerationAdapter: ModerationContentAdapter = {
  contentType: 'short',
  contentModel: 'Short',
  async lookup(contentId) {
    const short = await shortRepository.findById(contentId);
    if (!short) return { exists: false, ownerId: null };

    return { exists: true, ownerId: getOwnerId(short.userId) };
  },
  setModerationStatus(contentId, status) {
    return shortRepository.setModerationStatus(contentId, status);
  },
};
