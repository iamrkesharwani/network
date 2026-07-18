import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface FieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  label: string;
  error?: string;
  hint?: ReactNode;
  containerClassName?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType =
      type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div
        className={cn('relative mb-6 text-left field-root', containerClassName)}
      >
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'field-input',
            'w-full bg-transparent border-0 border-b border-white/9',
            'text-[--color-text-primary] text-base font-medium',
            'py-[0.55rem] pb-[0.65rem] px-[0.1rem] pr-8',
            'outline-none transition-colors duration-300',
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

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-[0.55rem] text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-[0.72rem] text-[--color-error]"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-[0.72rem] text-[--color-text-muted]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Field.displayName = 'Field';
export default Field;
