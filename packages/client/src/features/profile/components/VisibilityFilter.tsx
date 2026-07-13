import type { ContentVisibility, IVisibilityCounts } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

export type VisibilityFilterValue = ContentVisibility | 'all';

export interface VisibilityFilterProps {
  value: VisibilityFilterValue;
  onChange: (value: VisibilityFilterValue) => void;
  counts?: IVisibilityCounts;
}

const OPTIONS: { value: VisibilityFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
];

const VisibilityFilter = ({ value, onChange, counts }: VisibilityFilterProps) => (
  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-raised border border-border">
    {OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
          value === option.value
            ? 'bg-surface-overlay text-text-primary'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        {option.label}{counts ? ` (${counts[option.value]})` : ''}
      </button>
    ))}
  </div>
);

export default VisibilityFilter;
