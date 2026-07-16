import { cn } from '../../../../shared/utils/cn';

interface PreferenceSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PreferenceSwitch = ({
  label,
  checked,
  onChange,
}: PreferenceSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      checked ? 'bg-primary' : 'bg-surface-overlay'
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
);

export default PreferenceSwitch;
