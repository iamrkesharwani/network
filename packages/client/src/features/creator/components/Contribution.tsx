import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clapperboard, FileText, Flame, Zap } from 'lucide-react';
import { DAYS_OF_WEEK } from '@network/shared';

interface ContributionProps {
  uploadActivity: string[];
  videoPublishCount: number;
  shortPublishCount: number;
  postPublishCount: number;
}

const Contribution = ({
  uploadActivity,
  videoPublishCount,
  shortPublishCount,
  postPublishCount,
}: ContributionProps) => {
  const stats = useMemo(() => {
    const total = uploadActivity.length;

    const dayCounts = new Array(7).fill(0);
    const uniqueDays = new Set<string>();

    for (const iso of uploadActivity) {
      const d = new Date(iso);
      dayCounts[d.getDay()]++;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      uniqueDays.add(`${year}-${month}-${day}`);
    }

    let maxDayCount = 0;
    let bestDayIdx = 0;
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] > maxDayCount) {
        maxDayCount = dayCounts[i];
        bestDayIdx = i;
      }
    }
    const bestDayName = total === 0 ? 'N/A' : DAYS_OF_WEEK[bestDayIdx];

    const sortedDays = Array.from(uniqueDays).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const dateStr of sortedDays) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const currDate = new Date(y, m - 1, d);

      if (!lastDate) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round(
          (currDate.getTime() - lastDate.getTime()) / DAY_MS
        );
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      lastDate = currDate;
    }

    return {
      total,
      bestDay: bestDayName,
      maxStreak,
    };
  }, [uploadActivity]);

  if (uploadActivity.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 rounded-xl border border-border border-dashed bg-surface-overlay text-sm text-text-muted">
        No uploads yet. Publish your first video, short or post!
      </div>
    );
  }

  const contentCards = [
    {
      key: 'video',
      label: 'Video',
      value: videoPublishCount,
      icon: Clapperboard,
    },
    {
      key: 'short',
      label: 'Short',
      value: shortPublishCount,
      icon: Zap,
    },
    {
      key: 'post',
      label: 'Post',
      value: postPublishCount,
      icon: FileText,
    },
  ];

  const summaryCards = [
    {
      label: 'Most Active',
      value: stats.bestDay,
      icon: Calendar,
    },
    {
      label: 'Longest Streak',
      value: `${stats.maxStreak} ${stats.maxStreak === 1 ? 'day' : 'days'}`,
      icon: Flame,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
        {contentCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                type: 'spring',
                stiffness: 300,
                damping: 24,
              }}
              className="flex flex-col items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-primary-muted text-primary">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-lg sm:text-xl font-bold font-display text-text-primary mb-0.5 truncate">
                  {card.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-center sm:text-left font-medium text-text-muted uppercase tracking-wider">
                  {card.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {summaryCards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (contentCards.length + i) * 0.08,
              type: 'spring',
              stiffness: 300,
              damping: 24,
            }}
            className="flex justify-between items-center gap-3 p-4 rounded-xl border border-border bg-surface shadow-sm w-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-muted text-primary">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {card.label}
              </p>
            </div>
            <p className="text-xl font-bold font-display text-text-primary truncate">
              {card.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Contribution;
