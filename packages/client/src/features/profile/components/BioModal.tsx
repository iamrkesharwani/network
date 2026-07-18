import Modal from '../../../shared/ui/overlay/Modal';

export interface BioModalProps {
  bio: string;
  isOpen: boolean;
  onClose: () => void;
}

const BioModal = ({ bio, isOpen, onClose }: BioModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="About">
    <p className="whitespace-pre-wrap text-sm text-text-secondary">{bio}</p>
  </Modal>
);

export default BioModal;
