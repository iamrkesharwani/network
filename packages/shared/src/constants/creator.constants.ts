export const BADGE_CATALOG = {
  FIRST_UPLOAD: {
    label: '1st Upload',
    description: '1 video',
  },
  TENTH_UPLOAD: {
    label: '10th Upload',
    description: '10 videos',
  },
  CONSISTENT_CREATOR: {
    label: 'Consistent',
    description: '10 active days',
  },
} as const;

export const VIDEO_MILESTONE_CATALOG = {
  VIDEO_1K_VIEWS: { label: '1K Views', threshold: 1_000 },
  VIDEO_10K_VIEWS: { label: '10K Views', threshold: 10_000 },
  VIDEO_100K_VIEWS: { label: '100K Views', threshold: 100_000 },
  VIDEO_1M_VIEWS: { label: '1M Views', threshold: 1_000_000 },
} as const;

export const CREATOR_MILESTONE_CATALOG = {
  CREATOR_10K_VIEWS: { label: '10K Total Views', threshold: 10_000 },
  CREATOR_100K_VIEWS: { label: '100K Total Views', threshold: 100_000 },
  CREATOR_1M_VIEWS: { label: '1M Total Views', threshold: 1_000_000 },
} as const;

export const BADGE_IDS = Object.keys(
  BADGE_CATALOG
) as (keyof typeof BADGE_CATALOG)[];
export type BadgeId = (typeof BADGE_IDS)[number];

export const VIDEO_MILESTONE_IDS = Object.keys(
  VIDEO_MILESTONE_CATALOG
) as (keyof typeof VIDEO_MILESTONE_CATALOG)[];
export type VideoMilestoneId = (typeof VIDEO_MILESTONE_IDS)[number];

export const CREATOR_MILESTONE_IDS = Object.keys(
  CREATOR_MILESTONE_CATALOG
) as (keyof typeof CREATOR_MILESTONE_CATALOG)[];

export type CreatorMilestoneId = (typeof CREATOR_MILESTONE_IDS)[number];

export const VIDEO_MILESTONE_LIST = VIDEO_MILESTONE_IDS.map((id) => ({
  id,
  ...VIDEO_MILESTONE_CATALOG[id],
})).sort((a, b) => a.threshold - b.threshold);

export const CREATOR_MILESTONE_LIST = CREATOR_MILESTONE_IDS.map((id) => ({
  id,
  ...CREATOR_MILESTONE_CATALOG[id],
})).sort((a, b) => a.threshold - b.threshold);

export const TRUST_POINTS = {
  PUBLISH: 10,
  VIDEO_MILESTONE: 5,
  CREATOR_MILESTONE: 15,
  FIRST_UPLOAD_BADGE: 50,
  TENTH_UPLOAD_BADGE: 25,
  CONSISTENT_CREATOR_BADGE: 25,
  JURY_VOTE_MAJORITY: 8,
  JURY_VOTE_MINORITY: -4,
  VALID_REPORT_FILED: 6,
  FALSE_REPORT_FILED: -10,
} as const;

export type TrustSignalType = keyof typeof TRUST_POINTS;

export const CONSISTENT_CREATOR_DISTINCT_DAYS = 10;

export const TRUST_FEATURE_IDS = [
  'extended_tags',
  'priority_processing',
  'extended_uploads',
] as const;
export type TrustFeatureId = (typeof TRUST_FEATURE_IDS)[number];

export type TrustTierId = 'NEWCOMER' | 'ESTABLISHED' | 'TRUSTED' | 'VETERAN';

export interface TrustTierDefinition {
  id: TrustTierId;
  minScore: number;
  unlocks: TrustFeatureId[];
}

export const TRUST_TIERS: TrustTierDefinition[] = [
  { id: 'NEWCOMER', minScore: 0, unlocks: [] },
  { id: 'ESTABLISHED', minScore: 50, unlocks: ['extended_tags'] },
  { id: 'TRUSTED', minScore: 150, unlocks: ['priority_processing'] },
  { id: 'VETERAN', minScore: 400, unlocks: ['extended_uploads'] },
];

export const TRUST_TIER_LABELS: Record<TrustTierId, string> = {
  NEWCOMER: 'Newcomer',
  ESTABLISHED: 'Established',
  TRUSTED: 'Trusted',
  VETERAN: 'Veteran',
};

export const TRUST_FEATURE_LABELS: Record<TrustFeatureId, string> = {
  extended_tags: 'Extended tags',
  priority_processing: 'Priority processing',
  extended_uploads: 'Extended uploads',
};

export const TRUST_SIGNAL_LABELS: Record<TrustSignalType, string> = {
  PUBLISH: 'Publish a video, short, or post',
  VIDEO_MILESTONE: 'A video hits a view milestone',
  CREATOR_MILESTONE: 'Your total views hit a milestone',
  FIRST_UPLOAD_BADGE: 'Earn the "1st Upload" badge',
  TENTH_UPLOAD_BADGE: 'Earn the "10th Upload" badge',
  CONSISTENT_CREATOR_BADGE: 'Earn the "Consistent" badge (10 active days)',
  JURY_VOTE_MAJORITY: 'Vote with the majority on a jury review',
  JURY_VOTE_MINORITY: 'Vote against the majority on a jury review',
  VALID_REPORT_FILED: 'File a report that gets upheld',
  FALSE_REPORT_FILED: 'File a report that gets rejected',
};
