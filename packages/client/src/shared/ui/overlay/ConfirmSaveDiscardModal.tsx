import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from '../primitives/Button';

export interface ConfirmSaveDiscardModalProps {
  isOpen: boolean;
  itemLabel: string;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

const ConfirmSaveDiscardModal = ({
  isOpen,
  itemLabel,
  onKeepEditing,
  onDiscard,
  onSave,
}: ConfirmSaveDiscardModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onKeepEditing}
    className="max-w-sm bg-surface-raised"
  >
    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-muted">
        <AlertTriangle className="h-5 w-5 text-primary" strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-text-primary">
          Unsaved changes
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          You have unsaved changes to this {itemLabel}. Save them before
          leaving?
        </p>
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onKeepEditing}
          className="border border-text-primary text-text-primary"
        >
          Keep editing
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDiscard}
          className="border-danger text-danger hover:border-danger hover:bg-transparent"
        >
          Discard
        </Button>
      </div>
      <Button variant="primary" size="sm" className="w-full" onClick={onSave}>
        Save changes
      </Button>
    </div>
  </Modal>
);

export default ConfirmSaveDiscardModal;
