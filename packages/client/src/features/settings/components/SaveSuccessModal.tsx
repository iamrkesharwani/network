import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AUTO_DISMISS_MS } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';

export interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveSuccessModal = ({ isOpen, onClose }: SaveSuccessModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="relative max-w-xs bg-surface-raised"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-text-secondary hover:text-text-primary"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col items-center gap-3 py-2 text-center w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle">
          <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold text-text-primary">Saved</p>
      </div>
    </Modal>
  );
};

export default SaveSuccessModal;
