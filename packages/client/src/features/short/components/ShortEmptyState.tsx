import { Clapperboard } from 'lucide-react';

interface ShortEmptyStateProps {
  message?: string;
  subMessage?: string;
}

const ShortEmptyState = ({
  message = 'No shorts yet',
  subMessage = "When shorts are added they'll appear here.",
}: ShortEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-surface-raised flex items-center justify-center">
      <Clapperboard className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-text-primary">{message}</p>
      <p className="text-xs text-text-muted max-w-88">{subMessage}</p>
    </div>
  </div>
);

export default ShortEmptyState;
