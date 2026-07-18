import { type ComponentType, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';

interface MaskedFieldRowProps {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  maskedValue: string;
  isEditing: boolean;
  onEdit: () => void;
  children: ReactNode;
}

const MaskedFieldRow = ({
  label,
  icon: Icon,
  maskedValue,
  isEditing,
  onEdit,
  children,
}: MaskedFieldRowProps) => {
  if (isEditing) return <>{children}</>;

  return (
    <div className="mb-6">
      <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        {label}
      </p>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5">
        <span className="text-sm font-medium text-text-primary">
          {maskedValue}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
};

export default MaskedFieldRow;
