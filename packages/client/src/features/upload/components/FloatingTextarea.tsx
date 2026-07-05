import React, { forwardRef, useId, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';

interface BaseProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  containerClassName?: string;
  counter?: { current: number; max: number };
}

const FloatingTextarea = forwardRef<
  HTMLTextAreaElement,
  BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(
  (
    { label, error, hint, containerClassName, counter, className, ...props },
    ref
  ) => {
    const id = useId();
    return (
      <div
        className={cn('relative mb-6 text-left field-root', containerClassName)}
      >
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'field-input',
            'w-full bg-transparent border-0 border-b border-white/9 resize-none',
            'text-[--color-text-primary] text-base font-medium',
            'py-[0.55rem] pb-[0.65rem] px-[0.1rem]',
            'outline-none transition-colors duration-300 placeholder:text-transparent',
            error && 'border-[--color-error]',
            className
          )}
          {...props}
        />

        <label
          htmlFor={id}
          className="field-label absolute left-[0.1rem] top-[0.55rem] text-base font-normal text-[--color-text-muted] pointer-events-none origin-left"
        >
          {label}
        </label>

        <div
          className="field-underline absolute bottom-0 left-0 w-full h-px bg-[--color-primary] origin-left"
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
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea;
