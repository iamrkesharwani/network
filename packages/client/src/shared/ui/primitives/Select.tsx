import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface SelectProps<T extends string> {
  label?: string;
  icon?: ComponentType<{ className?: string }>;
  value: T | undefined;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
  triggerLabel?: string;
}

function Select<T extends string>({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  containerClassName,
  triggerLabel,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selected = options.find((option) => option.value === value);

  return (
    <div
      className={cn('relative mb-6 min-w-0', containerClassName)}
      ref={rootRef}
    >
      {label && (
        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          {label}
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
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
            'flex min-w-0 items-center gap-2',
            selected ? 'font-medium text-text-primary' : 'text-text-muted'
          )}
        >
          {selected?.icon && <selected.icon className="h-4 w-4 shrink-0" />}
          <span className={triggerLabel ? 'whitespace-nowrap' : 'truncate'}>
            {selected ? (triggerLabel ?? selected.label) : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-20 mt-1.5 max-h-56 w-max min-w-full overflow-y-auto rounded-lg border border-border bg-surface-raised py-1.5 shadow-xl shadow-black/20"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  aria-disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors',
                    option.disabled
                      ? 'cursor-not-allowed text-text-muted/40'
                      : 'cursor-pointer',
                    !option.disabled && isSelected
                      ? 'bg-primary-muted text-primary'
                      : '',
                    !option.disabled && !isSelected
                      ? 'text-text-primary hover:bg-surface-overlay'
                      : ''
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.icon && (
                      <option.icon className="h-4 w-4 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{option.label}</span>
                  </span>
                  {isSelected && !option.disabled && (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>
              );
            })}
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
}

export default Select;
