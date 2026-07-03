import { Lock, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/utils/cn';
import { useGetCatalogQuery, useGetMyProfileQuery } from '../creatorApi';

const BadgeShowcase = () => {
  const { data: catalogData } = useGetCatalogQuery();
  const { data: profileData } = useGetMyProfileQuery();

  const badgeCatalog = catalogData?.data.badges ?? {};
  const creatorMilestoneCatalog = catalogData?.data.creatorMilestones ?? {};

  const unlockedBadgeIds = new Set(
    (profileData?.data.badges ?? []).map((b) => b.id)
  );
  const unlockedCreatorMilestoneIds = new Set(
    (profileData?.data.creatorMilestones ?? []).map((m) => m.id)
  );

  const entries = [
    ...Object.entries(badgeCatalog).map(([id, def]) => {
      // Cast the unknown definition to its actual shape
      const badge = def as { label: string; description: string };
      return {
        id,
        ...badge,
        icon: Award,
        unlocked: unlockedBadgeIds.has(id as never),
      };
    }),
    ...Object.entries(creatorMilestoneCatalog).map(([id, def]) => {
      // Cast the unknown definition to its actual shape
      const milestone = def as { label: string };
      return {
        id,
        label: milestone.label,
        description: `Reach ${milestone.label.toLowerCase()}`,
        icon: TrendingUp,
        unlocked: unlockedCreatorMilestoneIds.has(id as never),
      };
    }),
  ];

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {entries.map((entry, i) => {
        const Icon = entry.icon;
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
              entry.unlocked
                ? 'border-primary/30 bg-primary-muted'
                : 'border-border bg-surface-overlay opacity-50'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                entry.unlocked ? 'text-primary' : 'text-text-muted'
              )}
            />
            {!entry.unlocked && (
              <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-text-muted" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BadgeShowcase;
