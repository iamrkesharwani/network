import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import type { ICreatorEvent } from '@network/shared';
import { creatorApi } from '../creatorApi';

export interface CelebrationItem {
  key: string;
  kind: 'badge' | 'videoMilestone' | 'creatorMilestone';
  label: string;
  description?: string;
}

export const useCreatorCelebration = () => {
  const dispatch = useAppDispatch();
  const [queue, setQueue] = useState<CelebrationItem[]>([]);

  const celebrate = useCallback(
    (event: ICreatorEvent | null) => {
      if (!event) return;

      dispatch(creatorApi.util.invalidateTags(['Creator']));

      const items: CelebrationItem[] = [
        ...event.newBadges.map((b) => ({
          key: `badge:${b.id}`,
          kind: 'badge' as const,
          label: b.label,
          description: b.description,
        })),
        ...event.newVideoMilestones.map((m) => ({
          key: `video-milestone:${m.id}`,
          kind: 'videoMilestone' as const,
          label: m.label,
        })),
        ...event.newCreatorMilestones.map((m) => ({
          key: `creator-milestone:${m.id}`,
          kind: 'creatorMilestone' as const,
          label: m.label,
        })),
      ];

      if (items.length > 0) {
        setQueue((q) => [...q, ...items]);
      }
    },
    [dispatch]
  );

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  return { current: queue[0] ?? null, celebrate, dismiss };
};
