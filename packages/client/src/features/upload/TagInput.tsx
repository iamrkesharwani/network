import { useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import {
  TAG_REGEX,
  MAX_TAGS,
  MIN_TAG_LENGTH,
  MAX_TAG_LENGTH,
} from '@network/shared';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

const TagInput = ({ value, onChange, error }: TagInputProps) => {
  const [draft, setDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;

    if (value.length >= MAX_TAGS) {
      setLocalError(`You can only add up to ${MAX_TAGS} tags.`);
      return;
    }

    if (tag.length < MIN_TAG_LENGTH || tag.length > MAX_TAG_LENGTH) {
      setLocalError('Tags must be 2–20 characters.');
      return;
    }

    if (!TAG_REGEX.test(tag)) {
      setLocalError('Tags can only contain letters and numbers.');
      return;
    }

    if (value.includes(tag)) {
      setLocalError('You already added that tag.');
      return;
    }

    setLocalError(null);
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      removeTag(value[value.length - 1] as string);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-text-secondary mb-2.5">
        Tags{' '}
        <span className="text-text-muted font-normal">
          ({value.length}/{MAX_TAGS})
        </span>
      </p>

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-lg border bg-surface-raised px-3 py-2.5 min-h-12 transition-colors',
          error ? 'border-error' : 'border-border focus-within:border-primary'
        )}
      >
        <AnimatePresence initial={false}>
          {value.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="inline-flex items-center gap-1 rounded-full bg-primary-muted text-primary text-xs font-medium pl-2.5 pr-1.5 py-1"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {value.length < MAX_TAGS && (
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setLocalError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => draft && addTag(draft)}
            placeholder={
              value.length === 0 ? 'Add tags (press Enter)…' : 'Add another…'
            }
            className="flex-1 min-w-32 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
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

export default TagInput;
