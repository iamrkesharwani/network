import Modal from '../../../../shared/ui/overlay/Modal';
import Button from '../../../../shared/ui/primitives/Button';
import { useLogoutOtherDevicesMutation } from '../../../auth/authApi';

interface SignOutOtherDevicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignOutOtherDevicesDialog = ({
  isOpen,
  onClose,
}: SignOutOtherDevicesDialogProps) => {
  const [logoutOtherDevices, { isLoading, error }] =
    useLogoutOtherDevicesMutation();

  const handleConfirm = async () => {
    await logoutOtherDevices().unwrap();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign out of all other devices"
    >
      <p className="mb-4 text-sm text-text-secondary">
        This signs you out everywhere except this device. Any other browser or
        app you're logged into will need to log back in.
      </p>

      {Boolean(error) && (
        <p role="alert" className="mb-3 text-sm text-error">
          Something went wrong. Please try again.
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
        <Button variant="danger" size="sm" onClick={handleConfirm} isLoading={isLoading}>
          Sign out other devices
        </Button>
      </div>
    </Modal>
  );
};

export default SignOutOtherDevicesDialog;
