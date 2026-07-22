import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface PassphraseFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

const PassphraseField = forwardRef<HTMLInputElement, PassphraseFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="mb-6">
        <p className="mb-2.5 text-sm font-medium text-text-secondary">
          {label}
        </p>

        <div className="relative">
          <input
            ref={ref}
            type={isVisible ? 'text' : 'password'}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 pr-10 text-sm font-medium text-text-primary outline-none transition-colors',
              error ? 'border-error' : 'border-border focus:border-primary',
              className
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? 'Hide passphrase' : 'Show passphrase'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary focus:outline-none"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PassphraseField.displayName = 'PassphraseField';

export default PassphraseField;
