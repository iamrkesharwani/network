import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetMyProfileQuery } from '../gamificationApi';
import { Flame } from 'lucide-react';

const XpBar = () => {
  const { data } = useGetMyProfileQuery();
  const profile = data?.data;

  if (!profile) return null;

  const { levelProgress } = profile;

  return (
    <Link
      to={'/upload'}
      className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-border bg-surface-raised hover:border-primary/40 transition-colors group"
      title={`Level ${levelProgress.level} · ${profile.xp.toLocaleString()} XP`}
    >
      <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[0.65rem] font-bold font-display shrink-0">
        {levelProgress.level}
      </span>

      <div className="flex flex-col gap-0.5 w-20">
        <div className="flex items-center justify-between text-[0.62rem] text-text-muted leading-none">
          <span className="font-medium text-text-secondary">
            Lvl {levelProgress.level}
          </span>

          <Flame className="w-2.5 h-2.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="h-1.5 w-full rounded-full bg-surface-overlay overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress.progressPercent}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </Link>
  );
};

export default XpBar;
