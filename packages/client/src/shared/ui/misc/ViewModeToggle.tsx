import { LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from '@network/shared';
import { cn } from '../../utils/cn';
import { useIsMobileLayout } from '../../hooks/useIsMobileLayout';

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => {
  const isMobile = useIsMobileLayout();

  if (!isMobile) return null;

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-raised border border-border">
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          value === 'grid'
            ? 'bg-surface-overlay text-icon-active'
            : 'text-icon hover:text-icon-hover'
        )}
      >
        <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
      </button>
      {isMobile && (
        <button
          type="button"
          aria-label="List view"
          aria-pressed={value === 'list'}
          onClick={() => onChange('list')}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            value === 'list'
              ? 'bg-surface-overlay text-icon-active'
              : 'text-icon hover:text-icon-hover'
          )}
        >
          <List className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
};

export default ViewModeToggle;
