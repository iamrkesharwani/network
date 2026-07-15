import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ReportableContentType } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface ContentTypePickerProps {
  value: ReportableContentType;
  onChange: (type: ReportableContentType) => void;
  options: readonly ReportableContentType[];
  labels: Record<ReportableContentType, string>;
}

const ContentTypePicker = ({
  value,
  onChange,
  options,
  labels,
}: ContentTypePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2 text-left text-sm transition-colors cursor-pointer',
          isOpen ? 'border-primary' : 'border-border hover:border-primary/40'
        )}
      >
        <span className="font-medium text-text-primary">{labels[value]}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 shrink-0 text-text-muted transition-transform',
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
            className="absolute z-20 mt-1.5 w-32 overflow-hidden rounded-lg border border-border bg-surface-raised py-1.5 shadow-xl shadow-black/20"
          >
            {options.map((type) => {
              const selected = value === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(type);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors cursor-pointer',
                    selected
                      ? 'bg-primary-muted text-primary'
                      : 'text-text-primary hover:bg-surface-overlay'
                  )}
                >
                  {labels[type]}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentTypePicker;
