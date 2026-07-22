import { useState } from 'react';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import {
  enterPassphraseSchema,
  type EnterPassphraseInput,
} from '../passphrase.schema';
import { useKeyBundleRecovery } from '../hooks/useKeyBundleRecovery';
import PassphraseField from './PassphraseField';

const WRONG_ATTEMPTS_BEFORE_RESET_PROMPT = 3;

interface KeyRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onKeyReady: (privateKey: CryptoKey) => void;
  onForgotPassphrase: () => void;
}

const KeyRecoveryModal = ({
  isOpen,
  onClose,
  userId,
  onKeyReady,
  onForgotPassphrase,
}: KeyRecoveryModalProps) => {
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const { recoverKey, isFetching } = useKeyBundleRecovery(userId, isOpen);

  const {
    register,
    reset,
    formState: { errors },
    submit,
    setError,
  } = useMediaEditForm<EnterPassphraseInput, EnterPassphraseInput>({
    schema: enterPassphraseSchema,
    defaultValues: { passphrase: '' },
    completenessRules: [],
  });

  const onSubmit = submit(async (data) => {
    try {
      const privateKey = await recoverKey(data.passphrase);
      reset({ passphrase: '' });
      setWrongAttempts(0);
      onKeyReady(privateKey);
      onClose();
    } catch {
      setWrongAttempts((count) => count + 1);
      setError('passphrase', { message: 'Incorrect passphrase. Try again.' });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlock secure messaging">
      <p className="mb-4 text-sm text-text-secondary">
        Enter your messaging passphrase to unlock your conversations on this
        device.
      </p>

      <form onSubmit={onSubmit}>
        <PassphraseField
          label="Messaging passphrase"
          autoComplete="current-password"
          {...register('passphrase')}
          error={errors.passphrase?.message}
        />

        <Button
          type="submit"
          isLoading={isFetching}
          className="w-full"
        >
          Unlock messaging
        </Button>
      </form>

      {wrongAttempts >= WRONG_ATTEMPTS_BEFORE_RESET_PROMPT && (
        <p className="mt-4 text-center text-xs text-text-muted">
          Forgotten your passphrase?{' '}
          <button
            type="button"
            onClick={onForgotPassphrase}
            className="font-medium text-primary hover:underline"
          >
            Reset messaging key
          </button>
        </p>
      )}
    </Modal>
  );
};

export default KeyRecoveryModal;
