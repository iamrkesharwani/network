import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { VIDEO_CATEGORIES, type VideoCategory } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { CategoryMeta } from '../CategoryMeta';

interface CategoryPickerProps {
  value: VideoCategory | undefined;
  onChange: (category: VideoCategory) => void;
  error?: string;
}

const CategoryPicker = ({ value, onChange, error }: CategoryPickerProps) => {
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

  const selectedMeta = value ? CategoryMeta[value] : undefined;
  const SelectedIcon = selectedMeta?.icon;

  return (
    <div className="mb-6" ref={rootRef}>
      <p className="text-sm font-medium text-text-secondary mb-2.5">Category</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg border bg-surface-raised px-3.5 py-2.5 text-left transition-colors cursor-pointer',
            error
              ? 'border-error'
              : isOpen
                ? 'border-primary'
                : 'border-border hover:border-primary/40'
          )}
        >
          <span className="flex items-center gap-2 text-sm min-w-0">
            {SelectedIcon && selectedMeta ? (
              <>
                <SelectedIcon className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate font-medium text-text-primary">
                  {selectedMeta.label}
                </span>
              </>
            ) : (
              <span className="text-text-muted">Select a category</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 shrink-0 text-text-muted transition-transform',
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
              className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised py-1.5 shadow-xl shadow-black/20"
            >
              {VIDEO_CATEGORIES.map((category) => {
                const meta = CategoryMeta[category];
                const Icon = meta.icon;
                const selected = value === category;

                return (
                  <button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(category);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer',
                      selected
                        ? 'bg-primary-muted text-primary'
                        : 'text-text-primary hover:bg-surface-overlay'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        selected ? 'text-primary' : 'text-icon'
                      )}
                    />
                    {meta.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-[0.72rem] text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CategoryPicker;
