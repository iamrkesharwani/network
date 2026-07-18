import { useState, type ComponentType, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PRONOUN_MAX_LENGTH, PRONOUNS_MAX_COUNT } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';

interface PronounsInputProps {
  value: string[];
  onChange: (pronouns: string[]) => void;
  icon?: ComponentType<{ className?: string }>;
  error?: string;
}

const PronounsInput = ({
  value,
  onChange,
  icon: Icon,
  error,
}: PronounsInputProps) => {
  const [draft, setDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const addPronoun = (raw: string) => {
    const pronoun = raw.trim();
    if (!pronoun) return;

    if (value.length >= PRONOUNS_MAX_COUNT) {
      setLocalError(`You can only add up to ${PRONOUNS_MAX_COUNT} pronouns.`);
      return;
    }

    if (pronoun.length > PRONOUN_MAX_LENGTH) {
      setLocalError(`Cannot exceed ${PRONOUN_MAX_LENGTH} characters.`);
      return;
    }

    if (
      value.some((existing) => existing.toLowerCase() === pronoun.toLowerCase())
    ) {
      setLocalError('You already added that pronoun.');
      return;
    }

    setLocalError(null);
    onChange([...value, pronoun]);
    setDraft('');
  };

  const removePronoun = (pronoun: string) => {
    onChange(value.filter((entry) => entry !== pronoun));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addPronoun(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      removePronoun(value[value.length - 1] as string);
    }
  };

  return (
    <div className="mb-6">
      <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        Pronouns
      </p>

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-lg border bg-surface-raised px-3.5 py-2.5 transition-colors',
          error ? 'border-error' : 'border-border focus-within:border-primary'
        )}
      >
        <AnimatePresence initial={false}>
          {value.map((pronoun) => (
            <motion.div
              key={pronoun}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="inline-flex items-center gap-1 rounded-full bg-primary-muted py-1 pl-2.5 pr-1.5 text-xs font-medium text-primary"
            >
              {pronoun}
              <button
                type="button"
                onClick={() => removePronoun(pronoun)}
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-primary/20"
                aria-label={`Remove pronoun ${pronoun}`}
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {value.length < PRONOUNS_MAX_COUNT && (
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setLocalError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => draft && addPronoun(draft)}
            placeholder={value.length === 0 ? 'e.g. he/him' : 'Add another…'}
            className="min-w-24 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        )}
      </div>

      {(error || localError) && (
        <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
          {error ?? localError}
        </p>
      )}
    </div>
  );
};

export default PronounsInput;
