import { useMemo } from 'react';
import { cn } from '../../../shared/utils/cn';

interface ContributionGraphProps {
  uploadActivity: string[];
}

const WEEKS = 53;
const DAY_MS = 24 * 60 * 60 * 1000;

const dayKey = (d: Date): string => d.toISOString().slice(0, 10);

const ContributionGraph = ({ uploadActivity }: ContributionGraphProps) => {
  const { weeks, maxCount } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const iso of uploadActivity) {
      const key = dayKey(new Date(iso));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Align the grid to start on a Sunday, WEEKS weeks back.
    const totalDays = WEEKS * 7;
    const start = new Date(today.getTime() - (totalDays - 1) * DAY_MS);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const cells: { date: Date; count: number }[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const date = new Date(start.getTime() + i * DAY_MS);
      cells.push({ date, count: counts.get(dayKey(date)) ?? 0 });
    }

    const weeksOut: { date: Date; count: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      weeksOut.push(cells.slice(w * 7, w * 7 + 7));
    }

    const maxCount = Math.max(1, ...cells.map((c) => c.count));

    return { weeks: weeksOut, maxCount };
  }, [uploadActivity]);

  const levelClass = (count: number): string => {
    if (count === 0) return 'bg-surface-overlay';
    const ratio = count / maxCount;
    if (ratio > 0.75) return 'bg-primary';
    if (ratio > 0.5) return 'bg-primary/70';
    if (ratio > 0.25) return 'bg-primary/45';
    return 'bg-primary/25';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${dayKey(cell.date)} · ${cell.count} publish${
                  cell.count === 1 ? '' : 'es'
                }`}
                className={cn('w-2.5 h-2.5 rounded-sm', levelClass(cell.count))}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGraph;
