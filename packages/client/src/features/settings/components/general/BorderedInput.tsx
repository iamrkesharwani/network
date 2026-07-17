import React, {
  forwardRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

interface BaseProps {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  error?: string;
  hint?: ReactNode;
  containerClassName?: string;
  counter?: { current: number; max: number };
}

const BorderedInput = forwardRef<
  HTMLInputElement,
  BaseProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      label,
      icon: Icon,
      error,
      hint,
      containerClassName,
      counter,
      className,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className={cn('mb-6', containerClassName)}>
        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          {label}
        </p>

        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors',
              error ? 'border-error' : 'border-border focus:border-primary',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {error && (
              <p role="alert" className="text-[0.72rem] text-error">
                {error}
              </p>
            )}
            {hint && !error && (
              <p className="text-[0.72rem] text-text-muted">{hint}</p>
            )}
          </div>

          {counter && (
            <span
              className={cn(
                'shrink-0 text-[0.68rem] tabular-nums tracking-wide',
                counter.current > counter.max ? 'text-error' : 'text-text-muted'
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

BorderedInput.displayName = 'BorderedInput';

export default BorderedInput;
