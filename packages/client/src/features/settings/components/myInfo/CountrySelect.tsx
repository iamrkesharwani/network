import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { COUNTRIES, type CountryDialCode } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';

interface CountrySelectProps {
  value: string;
  onChange: (iso2: string) => void;
  containerClassName?: string;
  error?: string;
}

const FlagIcon = ({ iso2 }: { iso2: string }) => (
  <span
    className={cn('fi', `fi-${iso2.toLowerCase()}`, 'inline-block h-3.5 w-5 shrink-0 rounded-[2px]')}
    aria-hidden="true"
  />
);

const matchesQuery = (country: CountryDialCode, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    country.name.toLowerCase().includes(normalized) ||
    country.iso2.toLowerCase().includes(normalized) ||
    country.dialCode.includes(normalized)
  );
};

const CountrySelect = ({ value, onChange, containerClassName, error }: CountrySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    searchRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selected = COUNTRIES.find((country) => country.iso2 === value) ?? COUNTRIES[0];
  const filtered = COUNTRIES.filter((country) => matchesQuery(country, query));

  return (
    <div className={cn('relative', containerClassName)} ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setIsOpen((open) => !open);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-surface-raised px-3.5 py-2.5 text-left text-sm transition-colors',
          error ? 'border-error' : isOpen ? 'border-primary' : 'border-border hover:border-primary/40'
        )}
      >
        <span className="flex min-w-0 items-center gap-2 font-medium text-text-primary">
          {selected && <FlagIcon iso2={selected.iso2} />}
          <span className="truncate">{selected?.dialCode}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')}
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
            className="absolute z-20 mt-1.5 w-64 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-xl shadow-black/20"
          >
            <div className="border-b border-border p-1.5">
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or code…"
                className="w-full rounded-md bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>

            <div className="max-h-56 overflow-y-auto py-1.5">
              {filtered.length === 0 && (
                <p className="px-3.5 py-2 text-sm text-text-muted">No countries found.</p>
              )}
              {filtered.map((country) => {
                const isSelected = country.iso2 === value;
                return (
                  <button
                    key={country.iso2}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(country.iso2);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary-muted text-primary'
                        : 'text-text-primary hover:bg-surface-overlay'
                    )}
                  >
                    <FlagIcon iso2={country.iso2} />
                    <span className="w-14 shrink-0 text-text-muted">{country.dialCode}</span>
                    <span className="truncate">{country.name}</span>
                  </button>
                );
              })}
            </div>
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

export default CountrySelect;
