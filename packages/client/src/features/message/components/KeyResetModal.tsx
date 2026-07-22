import { useState } from 'react';
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

type ResetStep = 'confirm' | 'setup';

interface KeyResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hasPassword: boolean;
  onKeyReady?: (privateKey: CryptoKey) => void;
}

const KeyResetModal = ({
  isOpen,
  onClose,
  userId,
  hasPassword,
  onKeyReady,
}: KeyResetModalProps) => {
  const [step, setStep] = useState<ResetStep>('confirm');
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

  const handleClose = () => {
    setStep('confirm');
    reset({ passphrase: '', confirmPassphrase: '' });
    onClose();
  };

  const onSubmit = submit(async (data) => {
    const privateKey = await setupNewKey(data.passphrase);
    onKeyReady?.(privateKey);
    handleClose();
  });

  if (step === 'confirm') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Reset your messaging key?"
      >
        <p className="mb-6 text-sm text-text-secondary">
          You'll set up a new messaging key, but you will permanently lose
          access to all your previous conversations. No one — including us —
          can recover old messages without your{' '}
          {hasPassword ? 'previous account password' : 'current passphrase'},
          because we never have it. This can't be undone.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setStep('setup')}
          >
            Reset and lose message history
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={hasPassword ? 'Confirm your account password' : 'Set a new messaging passphrase'}
    >
      <form onSubmit={onSubmit}>
        <PassphraseField
          label={hasPassword ? 'Account password' : 'New messaging passphrase'}
          autoComplete={hasPassword ? 'current-password' : 'new-password'}
          {...register('passphrase')}
          error={errors.passphrase?.message}
        />

        {!hasPassword && (
          <PassphraseField
            label="Confirm new passphrase"
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
          Reset messaging key
        </Button>
      </form>
    </Modal>
  );
};

export default KeyResetModal;
