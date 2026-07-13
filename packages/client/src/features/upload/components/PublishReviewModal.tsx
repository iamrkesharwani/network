import type { ReactNode } from 'react';
import { Rocket } from 'lucide-react';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';

export interface ReviewField {
  label: string;
  value: ReactNode;
}

interface PublishReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fields: ReviewField[];
  isPublishing: boolean;
  error?: string | null;
  confirmLabel?: string;
}

const PublishReviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  fields,
  isPublishing,
  error,
  confirmLabel = 'Confirm & publish',
}: PublishReviewModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={isPublishing ? () => {} : onClose}
    title="Ready to publish?"
    className="max-w-sm"
  >
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <div
          key={field.label}
          className="flex items-start justify-between gap-3 text-sm"
        >
          <span className="text-text-muted">{field.label}</span>
          <span className="min-w-0 text-right font-medium text-text-primary">
            {field.value}
          </span>
        </div>
      ))}
    </div>

    {error && (
      <p role="alert" className="mt-4 text-sm text-error">
        {error}
      </p>
    )}

    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        disabled={isPublishing}
      >
        Back to edit
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="gap-1.5"
        onClick={onConfirm}
        isLoading={isPublishing}
      >
        {!isPublishing && <Rocket className="h-4 w-4" />}
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default PublishReviewModal;
