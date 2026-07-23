import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import {
  enterPassphraseSchema,
  type EnterPassphraseInput,
} from '../passphrase.schema';
import { useKeyBundleRotation } from '../hooks/useKeyBundleRotation';
import { recordKeyRotation } from '../keyRotationStore';
import PassphraseField from './PassphraseField';

interface KeyRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hasPassword: boolean;
  currentPrivateKey: CryptoKey;
  onKeyReady: (privateKey: CryptoKey) => void;
}

const KeyRotationModal = ({
  isOpen,
  onClose,
  userId,
  hasPassword,
  currentPrivateKey,
  onKeyReady,
}: KeyRotationModalProps) => {
  const { rotateKey, isLoading } = useKeyBundleRotation(userId);

  const {
    register,
    reset,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<EnterPassphraseInput, EnterPassphraseInput>({
    schema: enterPassphraseSchema,
    defaultValues: { passphrase: '' },
    completenessRules: [],
  });

  const handleClose = () => {
    reset({ passphrase: '' });
    onClose();
  };

  const onSubmit = submit(async (data) => {
    const privateKey = await rotateKey(currentPrivateKey, data.passphrase);
    recordKeyRotation(userId);
    onKeyReady(privateKey);
    handleClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rotate your encryption key"
    >
      <p className="mb-6 text-sm text-text-secondary">
        This issues a fresh encryption key, so if a key ever leaked in the
        future, only messages sent since your last rotation would be
        exposed — not your entire history. Your existing conversations stay
        fully readable on this device; nothing is deleted.
      </p>

      <form onSubmit={onSubmit}>
        <PassphraseField
          label={hasPassword ? 'Account password' : 'Messaging passphrase'}
          autoComplete="current-password"
          {...register('passphrase')}
          error={errors.passphrase?.message}
        />

        {submitError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Rotate key
        </Button>
      </form>
    </Modal>
  );
};

export default KeyRotationModal;
