import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import Select from '../primitives/Select';
import { MONTH_LABELS, MONTH_SHORT_LABELS } from './utils/dateGrid';

interface CalendarMonthHeaderProps {
  monthAnchor: Date;
  minDate?: Date;
  maxDate?: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (monthIndex: number) => void;
  onSelectYear: (year: number) => void;
}

const CalendarMonthHeader = ({
  monthAnchor,
  minDate,
  maxDate,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  onSelectYear,
}: CalendarMonthHeaderProps) => {
  const currentYear = new Date().getFullYear();
  const earliestYear = minDate?.getFullYear() ?? currentYear - 120;
  const latestYear = maxDate?.getFullYear() ?? currentYear;

  const years = Array.from(
    { length: latestYear - earliestYear + 1 },
    (_, i) => latestYear - i
  );

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevMonth}
        aria-label="Previous month"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-icon transition-colors hover:bg-surface-overlay hover:text-icon-hover'
        )}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <Select
        value={MONTH_LABELS[monthAnchor.getMonth()]}
        onChange={(label) => onSelectMonth(MONTH_LABELS.indexOf(label))}
        options={MONTH_LABELS.map((label) => ({ value: label, label }))}
        triggerLabel={MONTH_SHORT_LABELS[monthAnchor.getMonth()]}
        containerClassName="mb-0 min-w-[76px] flex-1"
      />

      <Select
        value={String(monthAnchor.getFullYear())}
        onChange={(year) => onSelectYear(Number(year))}
        options={years.map((year) => ({
          value: String(year),
          label: String(year),
        }))}
        containerClassName="mb-0 w-24"
      />

      <button
        type="button"
        onClick={onNextMonth}
        aria-label="Next month"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-icon transition-colors hover:bg-surface-overlay hover:text-icon-hover'
        )}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default CalendarMonthHeader;
