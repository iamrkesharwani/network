import {
  Lock,
  Award,
  Rocket,
  Target,
  CalendarCheck,
  Eye,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/utils/cn';
import { useGetCatalogQuery, useGetMyProfileQuery } from '../creatorApi';

const ICON_MAP: Record<string, LucideIcon> = {
  FIRST_UPLOAD: Rocket,
  TENTH_UPLOAD: Target,
  CONSISTENT_CREATOR: CalendarCheck,
  CREATOR_10K_VIEWS: Eye,
  CREATOR_100K_VIEWS: Sparkles,
  CREATOR_1M_VIEWS: Trophy,
};

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
      const badge = def as { label: string; description: string };
      return {
        id,
        ...badge,
        icon: ICON_MAP[id] || Award,
        unlocked: unlockedBadgeIds.has(id as never),
      };
    }),
    ...Object.entries(creatorMilestoneCatalog).map(([id, def]) => {
      const milestone = def as { label: string };
      const shortLabel = milestone.label.split(' ')[0];
      return {
        id,
        label: shortLabel,
        description: 'Total Views',
        icon: ICON_MAP[id] || Trophy,
        unlocked: unlockedCreatorMilestoneIds.has(id as never),
      };
    }),
  ];

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full">
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
            className={cn(
              'group relative flex flex-col items-center justify-start gap-2.5 rounded-xl border p-3 text-center transition-colors',
              entry.unlocked
                ? 'border-primary/30 bg-primary-muted'
                : 'border-border bg-surface-overlay opacity-50'
            )}
          >
            <div className="relative shrink-0 mt-1">
              <Icon
                className={cn(
                  'w-7 h-7',
                  entry.unlocked ? 'text-primary' : 'text-text-muted'
                )}
              />
              {!entry.unlocked && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-surface rounded-full p-0.5">
                  <Lock className="w-3 h-3 text-text-muted" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 items-center w-full mt-1">
              <span className="text-[10px] font-bold text-text-primary leading-tight">
                {entry.label}
              </span>
              <span className="text-[9px] font-medium text-text-muted leading-tight line-clamp-1 px-1">
                {entry.description}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BadgeShowcase;
