import { Lock } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { getAchievementIcon } from '../achievementIcons';
import { useGetCatalogQuery, useGetMyProfileQuery } from '../gamificationApi';
import { motion } from 'framer-motion';

const AchievementCatalogGrid = () => {
  const { data: catalogData } = useGetCatalogQuery();
  const { data: profileData } = useGetMyProfileQuery();

  const catalog = catalogData?.data ?? [];
  const unlockedIds = new Set(
    (profileData?.data.achievements ?? []).map((a) => a.id)
  );

  if (catalog.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {catalog.map((entry, i) => {
        const unlocked = unlockedIds.has(entry.id);
        const Icon = getAchievementIcon(entry.icon);

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.04,
              type: 'spring',
              stiffness: 280,
              damping: 22,
            }}
            title={`${entry.label} — ${entry.description}`}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 aspect-square transition-colors',
              unlocked
                ? 'border-primary/30 bg-primary-muted'
                : 'border-border bg-surface-overlay opacity-50'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                unlocked ? 'text-primary' : 'text-text-muted'
              )}
            />
            {!unlocked && (
              <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-text-muted" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AchievementCatalogGrid;
