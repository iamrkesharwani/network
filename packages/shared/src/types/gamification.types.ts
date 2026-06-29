import type { AchievementId } from '../constants/gamification.constants.js';
import type { LevelProgress } from '../utils/gamification.js';

export interface IUnlockedAchievement {
  id: AchievementId;
  label: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: string;
}

export interface IAchievementCatalogEntry {
  id: AchievementId;
  label: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface IGamificationProfile {
  xp: number;
  uploadsCount: number;
  levelProgress: LevelProgress;
  achievements: IUnlockedAchievement[];
}

export interface IGamificationEvent {
  xpAwarded: number;
  totalXp: number;
  levelProgress: LevelProgress;
  leveledUp: boolean;
  newAchievements: IUnlockedAchievement[];
}
