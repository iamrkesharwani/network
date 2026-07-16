import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link2, X } from 'lucide-react';
import type { SocialPlatform } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import {
  findExactSocialPlatformSuggestion,
  matchSocialPlatformSuggestions,
  type SocialPlatformSuggestion,
} from '../../utils/socialPlatformSuggestions';

export interface SocialLinkRowValue {
  platform: SocialPlatform;
  url: string;
  customLabel?: string;
}

interface SocialLinkRowProps {
  value: SocialLinkRowValue;
  onChange: (next: SocialLinkRowValue) => void;
  onRemove: () => void;
  urlError?: string;
  platformError?: string;
}

const displayLabel = (value: SocialLinkRowValue): string =>
  value.platform === 'other' ? (value.customLabel ?? '') : (value.customLabel ?? value.platform);

const SocialLinkRow = ({ value, onChange, onRemove, urlError, platformError }: SocialLinkRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const label = displayLabel(value);
  const preview = findExactSocialPlatformSuggestion(label);
  const PreviewIcon = preview?.icon ?? Link2;
  const suggestions = matchSocialPlatformSuggestions(label);

  const handleSelect = (suggestion: SocialPlatformSuggestion) => {
    onChange({
      ...value,
      platform: suggestion.platform,
      customLabel: suggestion.customLabel,
    });
    setIsOpen(false);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-[2.6rem] w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised">
        <PreviewIcon className="h-4 w-4 text-text-muted" />
      </div>

      <div className="flex-1">
        <div className="relative" ref={rootRef}>
          <input
            value={label}
            onChange={(event) => {
              onChange({ ...value, platform: 'other', customLabel: event.target.value });
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Platform name"
            className={cn(
              'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors',
              platformError ? 'border-error' : 'border-border focus:border-primary'
            )}
          />

          <AnimatePresence>
            {isOpen && suggestions.length > 0 && (
              <motion.div
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-surface-raised shadow-xl shadow-black/20"
              >
                {suggestions.map((suggestion) => {
                  const SuggestionIcon = suggestion.icon;
                  return (
                    <button
                      key={`${suggestion.platform}-${suggestion.label}`}
                      type="button"
                      role="option"
                      onClick={() => handleSelect(suggestion)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-overlay"
                    >
                      <SuggestionIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      <span className="truncate">{suggestion.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {platformError && (
            <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
              {platformError}
            </p>
          )}
        </div>

        <input
          value={value.url}
          onChange={(event) => onChange({ ...value, url: event.target.value })}
          placeholder="URL"
          className={cn(
            'mt-2 w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors',
            urlError ? 'border-error' : 'border-border focus:border-primary'
          )}
        />
        {urlError && (
          <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
            {urlError}
          </p>
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
