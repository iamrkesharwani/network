import { cn } from '../../../shared/utils/cn';

interface PreferenceToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PreferenceToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
    <div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {description && (
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      )}
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        checked ? 'bg-primary' : 'bg-surface-raised'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  </div>
);

export default PreferenceToggleRow;
