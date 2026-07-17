import type { TrustTier } from './creator.types.js';
import { getCatalogIds, toSortedMilestoneList } from './creator.util.js';

export const CREATOR_EVENT_SOCKET_EVENT = 'creator:event';
export const CONSISTENT_CREATOR_DISTINCT_DAYS = 10;

export const BADGE_CATALOG = {
  FIRST_UPLOAD: {
    label: '1st Upload',
    description: '1 video',
    threshold: null,
    points: 50,
  },
  TENTH_UPLOAD: {
    label: '10th Upload',
    description: '10 videos',
    threshold: null,
    points: 25,
  },
  CONSISTENT_CREATOR: {
    label: 'Consistent',
    description: '10 active days',
    threshold: null,
    points: 25,
  },
  CREATOR_10K_VIEWS: {
    label: '10K Total Views',
    description: 'Total Views',
    threshold: 10_000,
    points: 15,
  },
  CREATOR_100K_VIEWS: {
    label: '100K Total Views',
    description: 'Total Views',
    threshold: 100_000,
    points: 15,
  },
  CREATOR_1M_VIEWS: {
    label: '1M Total Views',
    description: 'Total Views',
    threshold: 1_000_000,
    points: 15,
  },
} as const;

export const BADGE_IDS = getCatalogIds(BADGE_CATALOG);

export const VIDEO_MILESTONE_CATALOG = {
  VIDEO_1K_VIEWS: { label: '1K Views', threshold: 1_000, points: 5 },
  VIDEO_10K_VIEWS: { label: '10K Views', threshold: 10_000, points: 5 },
  VIDEO_100K_VIEWS: { label: '100K Views', threshold: 100_000, points: 5 },
  VIDEO_1M_VIEWS: { label: '1M Views', threshold: 1_000_000, points: 5 },
} as const;

export const VIDEO_MILESTONE_IDS = getCatalogIds(VIDEO_MILESTONE_CATALOG);

export const VIDEO_MILESTONE_LIST = toSortedMilestoneList(
  VIDEO_MILESTONE_CATALOG
);

export const CREATOR_VIEW_MILESTONE_LIST = toSortedMilestoneList(BADGE_CATALOG);

export const TRUST_SIGNAL_CATALOG = {
  PUBLISH: { label: 'First Publish', points: 10 },
  JURY_VOTE_MAJORITY: { label: 'Majority Vote', points: 8 },
  JURY_VOTE_MINORITY: { label: 'Minority Vote', points: -4 },
  VALID_REPORT_FILED: { label: 'Valid Report', points: 6 },
  FALSE_REPORT_FILED: { label: 'Rejected Report', points: -10 },
} as const;

export const TRUST_FEATURE_CATALOG = {
  extended_tags: { label: 'Extended tags' },
  priority_processing: { label: 'Priority processing' },
  extended_uploads: { label: 'Extended uploads' },
} as const;

export const TRUST_FEATURE_IDS = getCatalogIds(TRUST_FEATURE_CATALOG);

export const TRUST_TIERS = [
  { id: 'NEWCOMER', label: 'Newcomer', minScore: 0, unlocks: [] },
  {
    id: 'ESTABLISHED',
    label: 'Established',
    minScore: 50,
    unlocks: ['extended_tags'],
  },
  {
    id: 'TRUSTED',
    label: 'Trusted',
    minScore: 150,
    unlocks: ['priority_processing'],
  },
  {
    id: 'VETERAN',
    label: 'Veteran',
    minScore: 400,
    unlocks: ['extended_uploads'],
  },
] as const satisfies ReadonlyArray<TrustTier>;
