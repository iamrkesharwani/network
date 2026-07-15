import { ChevronLeft, X } from 'lucide-react';

function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mb-1 flex items-center gap-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-surface-raised"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <span className="flex-1 truncate px-1 text-sm font-medium text-text-primary">
        {title}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close settings"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-surface-raised"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default PanelHeader;
