import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clapperboard, Flame } from 'lucide-react';

interface ContributionProps {
  uploadActivity: string[];
}

const DAYS_OF_WEEK = [
  'Sundays',
  'Mondays',
  'Tuesdays',
  'Wednesdays',
  'Thursdays',
  'Fridays',
  'Saturdays',
];

const Contribution = ({ uploadActivity }: ContributionProps) => {
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
        No uploads yet. Publish your first video!
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Publishes',
      value: stats.total,
      icon: Clapperboard,
    },
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              type: 'spring',
              stiffness: 300,
              damping: 24,
            }}
            className="flex justify-between sm:justify-center sm:flex-col gap-3 p-4 rounded-xl border border-border bg-surface shadow-sm"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-muted text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <div className='flex flex-col'>
              <p className="text-xl text-right sm:text-left font-bold font-display text-text-primary mb-0.5 truncate">
                {card.value}
              </p>
              <p className="text-[11px] text-right sm:text-left font-medium text-text-muted uppercase tracking-wider">
                {card.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Contribution;
