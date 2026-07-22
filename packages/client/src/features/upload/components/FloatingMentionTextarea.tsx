import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';
import MentionTextArea from '../../../shared/ui/primitives/MentionTextArea';

interface FloatingMentionTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: ReactNode;
  containerClassName?: string;
  counter?: { current: number; max: number };
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const FloatingMentionTextarea = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  containerClassName,
  counter,
  maxLength,
  rows = 6,
  disabled,
  autoFocus,
}: FloatingMentionTextareaProps) => {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const shouldFloat = isFocused || value.length > 0;

  return (
    <div
      className={cn('relative mb-6 text-left field-root', containerClassName)}
    >
      <MentionTextArea
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        variant="underline"
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        autoFocus={autoFocus}
        className="field-input w-full text-base font-medium"
      />

      <label
        htmlFor={id}
        style={{
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease',
          transformOrigin: 'left top',
          ...(shouldFloat && { transform: 'translateY(-1.35rem) scale(0.72)' }),
          ...(isFocused
            ? { color: 'var(--color-primary)' }
            : shouldFloat && { color: 'rgba(240, 240, 237, 0.55)' }),
        }}
        className="field-label absolute left-[0.1rem] top-[0.55rem] flex items-center gap-1.5 text-base font-normal text-[--color-text-muted] pointer-events-none origin-left"
      >
        {label}
      </label>

      <div
        className="field-underline absolute bottom-0 left-0 w-full h-px bg-[--color-primary] origin-left"
        style={{
          transform: isFocused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden="true"
      />

      <div className="mt-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {error && (
            <p
              id={`${id}-error`}
              role="alert"
              className="text-[0.72rem] text-[--color-error]"
            >
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-[0.72rem] text-[--color-text-muted]">{hint}</p>
          )}
        </div>

        {counter && (
          <span
            className={cn(
              'shrink-0 text-[0.68rem] tabular-nums tracking-wide',
              counter.current > counter.max
                ? 'text-[--color-error]'
                : 'text-[--color-text-muted]'
            )}
          >
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingMentionTextarea;
