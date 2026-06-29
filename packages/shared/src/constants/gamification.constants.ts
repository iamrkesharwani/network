export const XP_RULES = {
  VIDEO_UPLOADED: 20,
  VIDEO_PUBLISHED: 50,
  PER_TAG: 5,
  MAX_TAG_XP: 50,
  DESCRIPTION_BONUS: 15,
  DESCRIPTION_BONUS_MIN_LENGTH: 50,
  CUSTOM_THUMBNAIL: 20,
} as const;

export const WORDSMITH_DESCRIPTION_MIN_LENGTH = 200;
export const TAG_MASTER_MIN_TAGS = 3;
export const MAX_TAGGER_MIN_TAGS = 10;
export const NIGHT_OWL_START_HOUR_UTC = 0;
export const NIGHT_OWL_END_HOUR_UTC = 5;

export const ACHIEVEMENT_IDS = [
  'FIRST_UPLOAD',
  'FIVE_UPLOADS',
  'TEN_UPLOADS',
  'TAG_MASTER',
  'MAX_TAGGER',
  'WORDSMITH',
  'THUMBNAIL_PRO',
  'NIGHT_OWL',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export interface AchievementDefinition {
  id: AchievementId;
  label: string;
  description: string;
  icon: string;
  xpReward: number;
}

export const ACHIEVEMENT_CATALOG: Record<
  AchievementId,
  Omit<AchievementDefinition, 'id'>
> = {
  FIRST_UPLOAD: {
    label: 'First Upload',
    description: 'Published your very first video.',
    icon: 'rocket',
    xpReward: 100,
  },
  FIVE_UPLOADS: {
    label: 'Rising Creator',
    description: 'Published 5 videos.',
    icon: 'flame',
    xpReward: 150,
  },
  TEN_UPLOADS: {
    label: 'Prolific Creator',
    description: 'Published 10 videos.',
    icon: 'trophy',
    xpReward: 300,
  },
  TAG_MASTER: {
    label: 'Tag Master',
    description: 'Added 3 or more tags to a video.',
    icon: 'tag',
    xpReward: 30,
  },
  MAX_TAGGER: {
    label: 'SEO Wizard',
    description: 'Used all 10 tag slots on a video.',
    icon: 'sparkles',
    xpReward: 50,
  },
  WORDSMITH: {
    label: 'Wordsmith',
    description: 'Wrote a description over 200 characters.',
    icon: 'feather',
    xpReward: 30,
  },
  THUMBNAIL_PRO: {
    label: 'Thumbnail Pro',
    description: 'Uploaded a custom thumbnail.',
    icon: 'image',
    xpReward: 30,
  },
  NIGHT_OWL: {
    label: 'Night Owl',
    description: 'Published a video between midnight and 5am.',
    icon: 'moon',
    xpReward: 25,
  },
};

export const ACHIEVEMENT_CATALOG_LIST: AchievementDefinition[] =
  ACHIEVEMENT_IDS.map((id) => ({ id, ...ACHIEVEMENT_CATALOG[id] }));
