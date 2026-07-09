import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

type Intent = 'danger' | 'warning' | 'info';

const intentConfig: Record<
  Intent,
  { icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-error-subtle',
    iconColor: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-primary-muted',
    iconColor: 'text-primary',
  },
  info: {
    icon: ShieldAlert,
    iconBg: 'bg-surface-overlay',
    iconColor: 'text-text-secondary',
  },
};

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: Intent;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'danger',
  isLoading = false,
}: ConfirmModalProps) => {
  const { icon: Icon, iconBg, iconColor } = intentConfig[intent];

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      className="max-w-sm bg-surface-raised"
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={intent === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
