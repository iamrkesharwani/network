import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import type { IGamificationEvent, IUnlockedAchievement } from '@network/shared';
import { gamificationApi } from '../gamificationApi';

interface LevelUpState {
  level: number;
}

export const useGamificationCelebration = () => {
  const dispatch = useAppDispatch();
  const [achievementQueue, setAchievementQueue] = useState<
    IUnlockedAchievement[]
  >([]);
  const [levelUp, setLevelUp] = useState<LevelUpState | null>(null);

  const celebrate = useCallback(
    (event: IGamificationEvent) => {
      dispatch(gamificationApi.util.invalidateTags(['Gamification']));

      if (event.newAchievements.length > 0) {
        setAchievementQueue((queue) => [...queue, ...event.newAchievements]);
      }

      if (event.leveledUp) {
        setLevelUp({ level: event.levelProgress.level });
      }
    },
    [dispatch]
  );

  const dismissAchievement = useCallback(() => {
    setAchievementQueue((queue) => queue.slice(1));
  }, []);

  const dismissLevelUp = useCallback(() => setLevelUp(null), []);

  return {
    currentAchievement: achievementQueue[0] ?? null,
    levelUp,
    celebrate,
    dismissAchievement,
    dismissLevelUp,
  };
};
