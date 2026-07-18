import { AnimatePresence, motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { cn } from '../../utils/cn';
import { buildMonthGrid, chunkIntoWeeks } from './utils/dateGrid';
import { WEEKDAY_LABELS } from '@network/shared';

interface CalendarMonthGridProps {
  monthAnchor: Date;
  direction: 1 | -1;
  selectedDate: Date | undefined;
  minDate?: Date;
  maxDate?: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarMonthGrid = ({
  monthAnchor,
  direction,
  selectedDate,
  minDate,
  maxDate,
  onSelectDate,
}: CalendarMonthGridProps) => {
  const weeks = chunkIntoWeeks(buildMonthGrid(monthAnchor));

  return (
    <div>
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={format(monthAnchor, 'yyyy-MM')}
            custom={direction}
            initial={{ x: 20 * direction, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20 * direction, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7"
          >
            {weeks.flatMap((week) =>
              week.map((day) => {
                const isSelected = selectedDate
                  ? isSameDay(day.date, selectedDate)
                  : false;
                const isDisabled =
                  (minDate && day.date < minDate) ||
                  (maxDate && day.date > maxDate);

                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={Boolean(isDisabled)}
                    onClick={() => onSelectDate(day.date)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-lg text-sm transition-colors',
                      !day.isCurrentMonth && 'text-text-muted/50',
                      day.isCurrentMonth && !isSelected && 'text-text-primary',
                      isDisabled && 'cursor-not-allowed opacity-30',
                      !isDisabled && !isSelected && 'hover:bg-surface-overlay',
                      isSelected && 'bg-primary font-semibold text-white',
                      !isSelected &&
                        day.isToday &&
                        'ring-1 ring-inset ring-primary/50'
                    )}
                  >
                    {format(day.date, 'd')}
                  </button>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarMonthGrid;
