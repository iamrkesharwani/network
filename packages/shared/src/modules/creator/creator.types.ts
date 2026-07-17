import type {
  BadgeId,
  VideoMilestoneId,
  CreatorMilestoneId,
  TrustTierId,
  TrustFeatureId,
  BADGE_CATALOG,
  VIDEO_MILESTONE_CATALOG,
  CREATOR_MILESTONE_CATALOG,
} from './creator.constants.js';

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

export interface ICreatorTrustSummary {
  score: number;
  tier: TrustTierId;
  unlockedFeatures: TrustFeatureId[];
  nextTier: {
    id: TrustTierId;
    pointsToNext: number;
  } | null;
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
  postPublishCount: number;
  trust: ICreatorTrustSummary;
}

export interface ICreatorCatalog {
  badges: typeof BADGE_CATALOG;
  videoMilestones: typeof VIDEO_MILESTONE_CATALOG;
  creatorMilestones: typeof CREATOR_MILESTONE_CATALOG;
}

export interface IVisibilityCounts {
  all: number;
  public: number;
  unlisted: number;
}
