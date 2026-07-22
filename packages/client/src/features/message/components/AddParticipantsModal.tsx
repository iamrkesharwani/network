import { useState } from 'react';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useAddParticipantsMutation } from '../conversationApi';
import ParticipantPicker, { type ParticipantCandidate } from './ParticipantPicker';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  existingParticipantIds: string[];
}

const AddParticipantsModal = ({
  isOpen,
  onClose,
  conversationId,
  existingParticipantIds,
}: AddParticipantsModalProps) => {
  const [selected, setSelected] = useState<ParticipantCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addParticipants, { isLoading }] = useAddParticipantsMutation();

  const toggleSelect = (candidate: ParticipantCandidate) => {
    setSelected((prev) =>
      prev.some((existing) => existing.id === candidate.id)
        ? prev.filter((existing) => existing.id !== candidate.id)
        : [...prev, candidate]
    );
  };

  const handleClose = () => {
    setSelected([]);
    setError(null);
    onClose();
  };

  const handleAdd = async () => {
    setError(null);
    if (selected.length === 0) {
      setError('Select at least one person to add.');
      return;
    }

    try {
      await addParticipants({
        conversationId,
        participantIds: selected.map((candidate) => candidate.id),
      }).unwrap();
      handleClose();
    } catch {
      setError('Could not add participants. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add participants">
      <ParticipantPicker
        selected={selected}
        onToggle={toggleSelect}
        excludeIds={existingParticipantIds}
      />

      {error && (
        <p className="mb-3 mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button onClick={handleAdd} isLoading={isLoading} className="mt-4 w-full">
        Add to group
      </Button>
    </Modal>
  );
};

export default AddParticipantsModal;
