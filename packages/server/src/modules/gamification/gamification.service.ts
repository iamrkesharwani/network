import {
  ACHIEVEMENT_CATALOG,
  XP_RULES,
  WORDSMITH_DESCRIPTION_MIN_LENGTH,
  TAG_MASTER_MIN_TAGS,
  MAX_TAGGER_MIN_TAGS,
  NIGHT_OWL_START_HOUR_UTC,
  NIGHT_OWL_END_HOUR_UTC,
  getLevelProgress,
  type AchievementId,
  type IGamificationProfile,
  type IGamificationEvent,
  type IUnlockedAchievement,
} from '@network/shared';
import * as gamificationRepository from './gamification.repository.js';
import type { IGamificationDocument } from './gamification.model.js';

interface PublishedVideoMeta {
  tags: string[];
  description?: string;
  hasCustomThumbnail: boolean;
}

const toUnlockedAchievements = (
  doc: IGamificationDocument,
  ids: AchievementId[]
): IUnlockedAchievement[] => {
  const idSet = new Set(ids);
  return doc.achievements
    .filter((a) => idSet.has(a.id))
    .map((a) => ({
      id: a.id,
      unlockedAt: a.unlockedAt.toISOString(),
      ...ACHIEVEMENT_CATALOG[a.id],
    }));
};

const toProfile = (doc: IGamificationDocument): IGamificationProfile => ({
  xp: doc.xp,
  uploadsCount: doc.uploadsCount,
  levelProgress: getLevelProgress(doc.xp),
  achievements: doc.achievements.map((a) => ({
    id: a.id,
    unlockedAt: a.unlockedAt.toISOString(),
    ...ACHIEVEMENT_CATALOG[a.id],
  })),
});

export const getProfile = async (
  userId: string
): Promise<IGamificationProfile> => {
  const doc = await gamificationRepository.getOrCreate(userId);
  return toProfile(doc);
};

const snapshotEvent = async (userId: string): Promise<IGamificationEvent> => {
  const doc = await gamificationRepository.getOrCreate(userId);
  return {
    xpAwarded: 0,
    totalXp: doc.xp,
    levelProgress: getLevelProgress(doc.xp),
    leveledUp: false,
    newAchievements: [],
  };
};

const applyAward = async (
  userId: string,
  directXp: number,
  achievementCandidates: AchievementId[]
): Promise<IGamificationEvent> => {
  const before = await gamificationRepository.getOrCreate(userId);
  const beforeLevel = getLevelProgress(before.xp).level;

  const newlyUnlockedIds: AchievementId[] = [];
  for (const id of achievementCandidates) {
    const unlocked = await gamificationRepository.unlockAchievement(userId, id);
    if (unlocked) newlyUnlockedIds.push(id);
  }

  const achievementXp = newlyUnlockedIds.reduce(
    (sum, id) => sum + ACHIEVEMENT_CATALOG[id].xpReward,
    0
  );
  const totalXpToAdd = directXp + achievementXp;

  const after =
    totalXpToAdd > 0
      ? await gamificationRepository.addXp(userId, totalXpToAdd)
      : await gamificationRepository.getOrCreate(userId);

  const afterLevel = getLevelProgress(after.xp).level;

  return {
    xpAwarded: totalXpToAdd,
    totalXp: after.xp,
    levelProgress: getLevelProgress(after.xp),
    leveledUp: afterLevel > beforeLevel,
    newAchievements: toUnlockedAchievements(after, newlyUnlockedIds),
  };
};

export const awardForUploadStarted = (
  userId: string
): Promise<IGamificationEvent> =>
  applyAward(userId, XP_RULES.VIDEO_UPLOADED, []);

export const awardForVideoPublished = async (
  userId: string,
  video: PublishedVideoMeta
): Promise<IGamificationEvent> => {
  let directXp = XP_RULES.VIDEO_PUBLISHED;

  const tagXp = Math.min(
    video.tags.length * XP_RULES.PER_TAG,
    XP_RULES.MAX_TAG_XP
  );
  directXp += tagXp;

  const descriptionLength = video.description?.length ?? 0;
  if (descriptionLength >= XP_RULES.DESCRIPTION_BONUS_MIN_LENGTH) {
    directXp += XP_RULES.DESCRIPTION_BONUS;
  }
  if (video.hasCustomThumbnail) {
    directXp += XP_RULES.CUSTOM_THUMBNAIL;
  }

  const newUploadsCount =
    await gamificationRepository.incrementUploadsCount(userId);

  const achievementCandidates: AchievementId[] = [];
  if (newUploadsCount === 1) achievementCandidates.push('FIRST_UPLOAD');
  if (newUploadsCount === 5) achievementCandidates.push('FIVE_UPLOADS');
  if (newUploadsCount === 10) achievementCandidates.push('TEN_UPLOADS');
  if (video.tags.length >= TAG_MASTER_MIN_TAGS) {
    achievementCandidates.push('TAG_MASTER');
  }
  if (video.tags.length >= MAX_TAGGER_MIN_TAGS) {
    achievementCandidates.push('MAX_TAGGER');
  }
  if (descriptionLength >= WORDSMITH_DESCRIPTION_MIN_LENGTH) {
    achievementCandidates.push('WORDSMITH');
  }
  if (video.hasCustomThumbnail) {
    achievementCandidates.push('THUMBNAIL_PRO');
  }
  const hour = new Date().getUTCHours();
  if (hour >= NIGHT_OWL_START_HOUR_UTC && hour < NIGHT_OWL_END_HOUR_UTC) {
    achievementCandidates.push('NIGHT_OWL');
  }

  return applyAward(userId, directXp, achievementCandidates);
};

export const getSnapshot = (userId: string): Promise<IGamificationEvent> =>
  snapshotEvent(userId);
