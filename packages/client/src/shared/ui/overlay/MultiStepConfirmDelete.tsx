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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const handleAdvance = () => {
    if (step === 3) {
      onConfirm();
      return;
    }
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const steps = {
    1: {
      title: `Delete this ${itemLabel}?`,
      description: `"${itemName}" will be removed from your profile.`,
      confirmLabel: 'Continue',
      intent: 'warning' as const,
    },
    2: {
      title: 'Are you sure?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Continue',
      intent: 'warning' as const,
    },
    3: {
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
