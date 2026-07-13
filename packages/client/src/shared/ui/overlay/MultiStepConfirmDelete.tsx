import { useEffect, useState } from 'react';
import ConfirmModal from './ConfirmModal';

export interface MultiStepConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel: string;
  itemName: string;
  isLoading?: boolean;
}

const MultiStepConfirmDelete = ({
  isOpen,
  onClose,
  onConfirm,
  itemLabel,
  itemName,
  isLoading = false,
}: MultiStepConfirmDeleteProps) => {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const handleAdvance = () => {
    if (step === 2) {
      onConfirm();
      return;
    }
    setStep(2);
  };

  const steps = {
    1: {
      title: `Delete this ${itemLabel}?`,
      description: `"${itemName}" will be removed from your profile. This action cannot be undone.`,
      confirmLabel: 'Continue',
      intent: 'warning' as const,
    },
    2: {
      title: 'Confirm deletion',
      description: `This is the final step. Click Delete to permanently remove this ${itemLabel}.`,
      confirmLabel: 'Delete',
      intent: 'danger' as const,
    },
  };

  const current = steps[step];

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleAdvance}
      title={current.title}
      description={current.description}
      confirmLabel={current.confirmLabel}
      intent={current.intent}
      isLoading={isLoading}
    />
  );
};

export default MultiStepConfirmDelete;
