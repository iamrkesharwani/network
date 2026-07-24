import { Trash2, X } from 'lucide-react';

interface ConversationSelectModeHeaderProps {
  selectedCount: number;
  onCancel: () => void;
  onDeleteSelected: () => void;
}

const ConversationSelectModeHeader = ({
  selectedCount,
  onCancel,
  onDeleteSelected,
}: ConversationSelectModeHeaderProps) => (
  <div className="mb-3 flex shrink-0 items-center gap-1.5">
    <button
      type="button"
      onClick={onCancel}
      aria-label="Cancel selection"
      className="shrink-0 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
    >
      <X className="h-5 w-5" strokeWidth={1.75} />
    </button>

    <p className="flex-1 text-sm font-medium text-text-primary">
      {selectedCount > 0 ? `${selectedCount} selected` : 'Select conversations'}
    </p>

    <button
      type="button"
      onClick={onDeleteSelected}
      disabled={selectedCount === 0}
      aria-label="Delete selected conversations"
      className="shrink-0 rounded-lg p-1.5 text-error hover:bg-error-subtle disabled:pointer-events-none disabled:opacity-40"
    >
      <Trash2 className="h-5 w-5" strokeWidth={1.75} />
    </button>
  </div>
);

export default ConversationSelectModeHeader;
