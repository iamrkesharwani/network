import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES, DEACTIVATION_MIN_DAYS, DEACTIVATION_MAX_DAYS } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useDeactivateAccountMutation } from '../accountApi';

interface DeactivateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_DAYS = 7;

const DeactivateAccountDialog = ({
  isOpen,
  onClose,
}: DeactivateAccountDialogProps) => {
  const navigate = useNavigate();
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [deactivateAccount, { isLoading, error }] =
    useDeactivateAccountMutation();

  const handleConfirm = async () => {
    await deactivateAccount({ days }).unwrap();
    navigate(CLIENT_ROUTES.LOGIN);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate account">
      <p className="mb-4 text-sm text-text-secondary">
        Your profile and content will be hidden until you log back in. If you
        don't log back in within the window you choose, your account
        reactivates on its own — nothing is deleted.
      </p>

      <label className="mb-1.5 block text-xs font-medium text-text-secondary">
        Deactivate for how many days?
      </label>
      <input
        type="number"
        min={DEACTIVATION_MIN_DAYS}
        max={DEACTIVATION_MAX_DAYS}
        value={days}
        onChange={(event) => setDays(Number(event.target.value))}
        className="mb-4 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
      />

      {Boolean(error) && (
        <p role="alert" className="mb-3 text-sm text-error">
          Something went wrong. Please try again.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleConfirm}
          isLoading={isLoading}
        >
          Deactivate
        </Button>
      </div>
    </Modal>
  );
};

export default DeactivateAccountDialog;
