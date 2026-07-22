import { useState } from 'react';
import { GROUP_NAME_MAX_LENGTH } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useCreateGroupConversationMutation } from '../conversationApi';
import ParticipantPicker, { type ParticipantCandidate } from './ParticipantPicker';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

const CreateGroupModal = ({ isOpen, onClose, onCreated }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<ParticipantCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createGroupConversation, { isLoading }] =
    useCreateGroupConversationMutation();

  const toggleSelect = (candidate: ParticipantCandidate) => {
    setSelected((prev) =>
      prev.some((existing) => existing.id === candidate.id)
        ? prev.filter((existing) => existing.id !== candidate.id)
        : [...prev, candidate]
    );
  };

  const handleClose = () => {
    setGroupName('');
    setSelected([]);
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    setError(null);
    if (!groupName.trim() || selected.length < 2) {
      setError('Add a group name and at least 2 participants.');
      return;
    }

    try {
      const result = await createGroupConversation({
        groupName: groupName.trim(),
        participantIds: selected.map((candidate) => candidate.id),
      }).unwrap();
      onCreated(result.data.id);
      handleClose();
    } catch {
      setError('Could not create the group. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New group">
      <input
        value={groupName}
        onChange={(event) => setGroupName(event.target.value)}
        maxLength={GROUP_NAME_MAX_LENGTH}
        placeholder="Group name"
        className="mb-3 w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <ParticipantPicker selected={selected} onToggle={toggleSelect} />

      {error && (
        <p className="mb-3 mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button onClick={handleCreate} isLoading={isLoading} className="mt-4 w-full">
        Create group
      </Button>
    </Modal>
  );
};

export default CreateGroupModal;
