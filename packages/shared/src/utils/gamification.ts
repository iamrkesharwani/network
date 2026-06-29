export const xpForLevel = (level: number): number => {
  return Math.round((100 * (level - 1) * level) / 2);
};

export const calculateLevel = (xp: number): number => {
  if (xp <= 0) return 1;

  const estimate = Math.floor((50 + Math.sqrt(2500 + 200 * xp)) / 100);
  let level = Math.max(1, estimate);

  while (xpForLevel(level + 1) <= xp) level++;
  while (level > 1 && xpForLevel(level) > xp) level--;

  return level;
};

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  progressPercent: number;
}

export const getLevelProgress = (xp: number): LevelProgress => {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercent =
    xpNeededForLevel === 0
      ? 100
      : Math.min(100, Math.round((xpIntoLevel / xpNeededForLevel) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForLevel,
    progressPercent,
  };
};
