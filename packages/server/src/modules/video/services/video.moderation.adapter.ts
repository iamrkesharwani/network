import type { ModerationContentAdapter } from '../../../core/moderation/moderationContent.types.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import * as videoRepository from '../video.repository.js';

export const videoModerationAdapter: ModerationContentAdapter = {
  contentType: 'video',
  contentModel: 'Video',
  async lookup(contentId) {
    const video = await videoRepository.findById(contentId);
    if (!video) return { exists: false, ownerId: null };

    return { exists: true, ownerId: getOwnerId(video.userId) };
  },
  setModerationStatus(contentId, status) {
    return videoRepository.setModerationStatus(contentId, status);
  },
};
