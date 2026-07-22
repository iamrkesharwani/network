import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import {
  setPassphraseSchema,
  confirmAccountPasswordSchema,
  type SetPassphraseInput,
} from '../passphrase.schema';
import { useKeyBundleSetup } from '../hooks/useKeyBundleSetup';
import PassphraseField from './PassphraseField';

interface KeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hasPassword: boolean;
  onKeyReady?: (privateKey: CryptoKey) => void;
}

const KeySetupModal = ({
  isOpen,
  onClose,
  userId,
  hasPassword,
  onKeyReady,
}: KeySetupModalProps) => {
  const { setupNewKey, isLoading: isPublishing } = useKeyBundleSetup(userId);
  const {
    register,
    reset,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<SetPassphraseInput, SetPassphraseInput>({
    schema: hasPassword ? confirmAccountPasswordSchema : setPassphraseSchema,
    defaultValues: { passphrase: '', confirmPassphrase: '' },
    completenessRules: [],
  });

  const onSubmit = submit(async (data) => {
    const privateKey = await setupNewKey(data.passphrase);
    reset({ passphrase: '', confirmPassphrase: '' });
    onKeyReady?.(privateKey);
    onClose();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set up secure messaging">
      <p className="mb-4 text-sm text-text-secondary">
        {hasPassword ? (
          <>
            Confirm your account password to encrypt your conversations
            end-to-end. We never store it — if you change your password later,
            your messaging key follows automatically.
          </>
        ) : (
          <>
            Choose a messaging passphrase. It encrypts your conversations
            end-to-end. We never see it, and we can't recover it for you if
            it's forgotten.{' '}
            <span className="font-bold text-primary">
              This is separate from your account password.
            </span>
          </>
        )}
      </p>

      <form onSubmit={onSubmit}>
        <PassphraseField
          label={hasPassword ? 'Account password' : 'Messaging passphrase'}
          autoComplete={hasPassword ? 'current-password' : 'new-password'}
          {...register('passphrase')}
          error={errors.passphrase?.message}
        />

        {!hasPassword && (
          <PassphraseField
            label="Confirm passphrase"
            autoComplete="new-password"
            {...register('confirmPassphrase')}
            error={errors.confirmPassphrase?.message}
          />
        )}

        {submitError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" isLoading={isPublishing} className="w-full">
          Set up messaging
        </Button>
      </form>
    </Modal>
  );
};

export default KeySetupModal;
