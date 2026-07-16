import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useController, type Control, type FieldPath } from 'react-hook-form';
import { Link2, X } from 'lucide-react';
import type { ContactLinksInput } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import {
  findExactSocialPlatformSuggestion,
  matchSocialPlatformSuggestions,
  type SocialPlatformSuggestion,
} from '../../utils/socialPlatformSuggestions';

interface SocialLinkRowProps {
  control: Control<ContactLinksInput>;
  index: number;
  onRemove: () => void;
  urlError?: string;
  platformError?: string;
}

const SocialLinkRow = ({
  control,
  index,
  onRemove,
  urlError,
  platformError,
}: SocialLinkRowProps) => {
  const { field: platformField } = useController({
    control,
    name: `socialLinks.${index}.platform` as FieldPath<ContactLinksInput>,
  });
  const { field: customLabelField } = useController({
    control,
    name: `socialLinks.${index}.customLabel` as FieldPath<ContactLinksInput>,
  });
  const { field: urlField } = useController({
    control,
    name: `socialLinks.${index}.url` as FieldPath<ContactLinksInput>,
  });

  const platformValue = platformField.value as string;
  const customLabelValue = (customLabelField.value as string | undefined) ?? '';
  const urlValue = (urlField.value as string | undefined) ?? '';

  const label =
    platformValue === 'other'
      ? customLabelValue
      : customLabelValue || platformValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isConfirmed, setIsConfirmed] = useState(() => label.trim().length > 0);

  const rootRef = useRef<HTMLDivElement>(null);
  const platformInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => matchSocialPlatformSuggestions(label),
    [label]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (label.trim().length > 0) {
          setIsConfirmed(true);
        }
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, label]);

  const preview = findExactSocialPlatformSuggestion(label);
  const PreviewIcon = preview?.icon ?? Link2;

  const focusUrlSoon = () => {
    requestAnimationFrame(() => urlInputRef.current?.focus());
  };

  const commitSuggestion = (suggestion: SocialPlatformSuggestion) => {
    platformField.onChange(suggestion.platform);
    customLabelField.onChange(suggestion.customLabel);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setIsConfirmed(true);
    focusUrlSoon();
  };

  const confirmManualEntry = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    platformField.onChange('other');
    customLabelField.onChange(trimmed);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setIsConfirmed(true);
    focusUrlSoon();
  };

  const editPlatform = () => {
    setIsConfirmed(false);
    setIsOpen(true);
    requestAnimationFrame(() => {
      const el = platformInputRef.current;
      el?.focus();
      el?.select();
    });
  };

  const handlePlatformChange = (event: ChangeEvent<HTMLInputElement>) => {
    platformField.onChange('other');
    customLabelField.onChange(event.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handlePlatformKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (suggestions.length === 0) return;
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen || suggestions.length === 0) return;
      setHighlightedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        commitSuggestion(suggestions[highlightedIndex]);
      } else {
        confirmManualEntry();
      }
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handlePlatformColumnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
      setHighlightedIndex(-1);
      if (label.trim().length > 0) {
        setIsConfirmed(true);
      }
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-[2.6rem] w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised">
        <PreviewIcon className="h-4 w-4 text-text-muted" />
      </div>

      <div className="flex-1">
        <div className="relative flex items-start gap-2" ref={rootRef}>
          <motion.div
            layout
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onBlur={handlePlatformColumnBlur}
            className={cn('relative', isConfirmed ? 'w-36 shrink-0' : 'w-full')}
          >
            <input
              ref={platformInputRef}
              value={label}
              onChange={handlePlatformChange}
              onFocus={() => {
                if (!isConfirmed) setIsOpen(true);
              }}
              onClick={() => {
                if (isConfirmed) editPlatform();
              }}
              onKeyDown={handlePlatformKeyDown}
              readOnly={isConfirmed}
              placeholder="Platform name"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={`social-suggestions-${index}`}
              aria-autocomplete="list"
              className={cn(
                'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors',
                isConfirmed && 'cursor-pointer truncate',
                platformError
                  ? 'border-error'
                  : 'border-border focus:border-primary'
              )}
            />

            <AnimatePresence>
              {isOpen && suggestions.length > 0 && (
                <motion.div
                  id={`social-suggestions-${index}`}
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute z-20 mt-1.5 w-56 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-xl shadow-black/20"
                >
                  {suggestions.map((suggestion, suggestionIndex) => {
                    const SuggestionIcon = suggestion.icon;
                    const isHighlighted = suggestionIndex === highlightedIndex;
                    return (
                      <button
                        key={`${suggestion.platform}-${suggestion.label}`}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseEnter={() =>
                          setHighlightedIndex(suggestionIndex)
                        }
                        onClick={() => commitSuggestion(suggestion)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-text-primary transition-colors',
                          isHighlighted
                            ? 'bg-surface-overlay'
                            : 'hover:bg-surface-overlay'
                        )}
                      >
                        <SuggestionIcon className="h-4 w-4 shrink-0 text-text-muted" />
                        <span className="truncate">{suggestion.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence initial={false}>
            {isConfirmed && (
              <motion.div
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <input
                  ref={urlInputRef}
                  value={urlValue}
                  onChange={(event) => urlField.onChange(event.target.value)}
                  onBlur={urlField.onBlur}
                  placeholder="URL"
                  className={cn(
                    'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors',
                    urlError
                      ? 'border-error'
                      : 'border-border focus:border-primary'
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(platformError || urlError) && (
          <div className="mt-1.5 flex gap-3">
            {platformError && (
              <p role="alert" className="text-[0.72rem] text-error">
                {platformError}
              </p>
            )}
            {urlError && (
              <p role="alert" className="text-[0.72rem] text-error">
                {urlError}
              </p>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove social link"
        className="mt-2.5 shrink-0 rounded-md p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SocialLinkRow;
