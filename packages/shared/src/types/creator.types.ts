import type {
  BadgeId,
  VideoMilestoneId,
  CreatorMilestoneId,
} from '../constants/creator.constants.js';

export interface ICreatorEvent {
  newBadges: Array<{
    id: BadgeId;
    label: string;
    description: string;
    unlockedAt: string;
  }>;
  newVideoMilestones: Array<{
    id: VideoMilestoneId;
    label: string;
    unlockedAt: string;
  }>;
  newCreatorMilestones: Array<{
    id: CreatorMilestoneId;
    label: string;
    unlockedAt: string;
  }>;
}

export interface ICreatorProfile {
  badges: Array<{ id: BadgeId; unlockedAt: string }>;
  videoMilestones: Array<{
    videoId: string;
    id: VideoMilestoneId;
    unlockedAt: string;
  }>;
  creatorMilestones: Array<{ id: CreatorMilestoneId; unlockedAt: string }>;
  unlockedFeatures: string[];
  uploadActivity: string[];
  videoPublishCount: number;
  shortPublishCount: number;
}

export interface ICreatorCatalog {
  badges: typeof import('../constants/creator.constants.js').BADGE_CATALOG;
  videoMilestones: typeof import('../constants/creator.constants.js').VIDEO_MILESTONE_CATALOG;
  creatorMilestones: typeof import('../constants/creator.constants.js').CREATOR_MILESTONE_CATALOG;
}
