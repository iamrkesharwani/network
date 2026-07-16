import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, CONTENT_RETENTION_DAYS } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useDeleteAccountMutation } from '../accountApi';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountDialog = ({ isOpen, onClose }: DeleteAccountDialogProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [deleteAccount, { isLoading, error }] = useDeleteAccountMutation();

  const handleConfirm = async () => {
    await deleteAccount({ password }).unwrap();
    navigate(CLIENT_ROUTES.LOGIN);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete account">
      <p className="mb-4 text-sm text-text-secondary">
        Your account and everything you own: videos, shorts, and posts - will be
        permanently deleted in {CONTENT_RETENTION_DAYS} days. Logging back in
        before then cancels the deletion; after that, it can't be undone.
      </p>

      <label className="mb-1.5 block text-xs font-medium text-text-secondary">
        Confirm your password
      </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-4 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
      />

      {Boolean(error) && (
        <p role="alert" className="mb-3 text-sm text-error">
          Something went wrong. Please check your password and try again.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={!password}
        >
          Delete account
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteAccountDialog;
