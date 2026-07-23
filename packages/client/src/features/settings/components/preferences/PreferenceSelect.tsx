import { cn } from '../../../../shared/utils/cn';

interface PreferenceSelectOption<T extends string> {
  value: T;
  label: string;
}

interface PreferenceSelectProps<T extends string> {
  label: string;
  value: T;
  options: PreferenceSelectOption<T>[];
  onChange: (value: T) => void;
}

const PreferenceSelect = <T extends string>({
  label,
  value,
  options,
  onChange,
}: PreferenceSelectProps<T>) => (
  <select
    aria-label={label}
    value={value}
    onChange={(event) => onChange(event.target.value as T)}
    className={cn(
      'rounded-md border border-border bg-surface-raised px-3 py-1.5 text-sm text-text-primary',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    )}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default PreferenceSelect;
