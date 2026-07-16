import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  isValid,
} from 'date-fns';
import { cn } from '../../utils/cn';
import CalendarMonthHeader from './CalendarMonthHeader';
import CalendarMonthGrid from './CalendarMonthGrid';

interface DatePickerProps {
  label?: string;
  icon?: ComponentType<{ className?: string }>;
  value: Date | undefined;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: string;
}

const toValidDate = (input: unknown): Date | undefined => {
  if (!input) return undefined;
  const date = input instanceof Date ? input : new Date(input as string);
  return isValid(date) ? date : undefined;
};

const DatePicker = ({
  label,
  icon: Icon,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select a date',
  error,
}: DatePickerProps) => {
  const normalizedValue = toValidDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [monthAnchor, setMonthAnchor] = useState(
    normalizedValue ?? maxDate ?? new Date()
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectDate = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative mb-6', label ? '' : '')} ref={rootRef}>
      {label && (
        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          {label}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setMonthAnchor(normalizedValue ?? maxDate ?? new Date());
          setIsOpen((open) => !open);
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-surface-raised px-3.5 py-2.5 text-left text-sm transition-colors',
          error
            ? 'border-error'
            : isOpen
              ? 'border-primary'
              : 'border-border hover:border-primary/40'
        )}
      >
        <span
          className={cn(
            'truncate',
            normalizedValue
              ? 'font-medium text-text-primary'
              : 'text-text-muted'
          )}
        >
          {normalizedValue
            ? format(normalizedValue, 'MMMM d, yyyy')
            : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-20 mt-1.5 w-72 rounded-xl border border-border bg-surface-raised p-3 shadow-xl shadow-black/20"
          >
            <CalendarMonthHeader
              monthAnchor={monthAnchor}
              minDate={minDate}
              maxDate={maxDate}
              onPrevMonth={() => {
                setDirection(-1);
                setMonthAnchor((current) => subMonths(current, 1));
              }}
              onNextMonth={() => {
                setDirection(1);
                setMonthAnchor((current) => addMonths(current, 1));
              }}
              onSelectMonth={(monthIndex) =>
                setMonthAnchor((current) => setMonth(current, monthIndex))
              }
              onSelectYear={(year) =>
                setMonthAnchor((current) => setYear(current, year))
              }
            />

            <CalendarMonthGrid
              monthAnchor={monthAnchor}
              direction={direction}
              selectedDate={normalizedValue}
              minDate={minDate}
              maxDate={maxDate}
              onSelectDate={handleSelectDate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
