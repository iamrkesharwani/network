import { type ReactNode } from 'react';
import { Pencil } from 'lucide-react';

interface MaskedFieldRowProps {
  label: string;
  maskedValue: string;
  isEditing: boolean;
  onEdit: () => void;
  children: ReactNode;
}

const MaskedFieldRow = ({
  label,
  maskedValue,
  isEditing,
  onEdit,
  children,
}: MaskedFieldRowProps) => {
  if (isEditing) return <>{children}</>;

  return (
    <div className="relative mb-6 text-left field-root">
      <div className="flex items-center justify-between border-b border-white/9 py-[0.55rem] pb-[0.65rem]">
        <span className="text-base font-medium text-text-primary">
          {maskedValue}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <label className="absolute left-[0.1rem] -top-2 text-[0.68rem] font-normal text-text-muted">
        {label}
      </label>
    </div>
  );
};

export default MaskedFieldRow;
