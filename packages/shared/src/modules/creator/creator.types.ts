import type {
  BADGE_IDS,
  VIDEO_MILESTONE_IDS,
  TRUST_FEATURE_IDS,
  TRUST_SIGNAL_CATALOG,
  TRUST_TIERS,
  BADGE_CATALOG,
  VIDEO_MILESTONE_CATALOG,
} from './creator.constants.js';

export type BadgeId = (typeof BADGE_IDS)[number];
export type VideoMilestoneId = (typeof VIDEO_MILESTONE_IDS)[number];
export type TrustFeatureId = (typeof TRUST_FEATURE_IDS)[number];
export type TrustSignalType = keyof typeof TRUST_SIGNAL_CATALOG;
export type TrustTierDefinition = (typeof TRUST_TIERS)[number];
export type TrustTierId = TrustTierDefinition['id'];

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
}

export interface IVisibilityCounts {
  all: number;
  public: number;
  unlisted: number;
}

export interface TrustTier {
  id: string;
  label: string;
  minScore: number;
  unlocks: ReadonlyArray<(typeof TRUST_FEATURE_IDS)[number]>;
}


