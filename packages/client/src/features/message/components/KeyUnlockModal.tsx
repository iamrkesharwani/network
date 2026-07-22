import { useState } from 'react';
import type { IKeyBundleOwnResponse } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import {
  enterPassphraseSchema,
  type EnterPassphraseInput,
  recoveryTokenSchema,
  type RecoveryTokenInput,
} from '../passphrase.schema';
import { useKeyBundleUnlock } from '../hooks/useKeyBundleUnlock';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import PassphraseField from './PassphraseField';

type UnlockMode = 'passphrase' | 'recover';

interface KeyUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  hasPassword: boolean;
  keyBundle?: IKeyBundleOwnResponse;
  onKeyReady: (privateKey: CryptoKey) => void;
  onReset: () => void;
}

const KeyUnlockModal = ({
  isOpen,
  onClose,
  userId,
  hasPassword,
  keyBundle,
  onKeyReady,
  onReset,
}: KeyUnlockModalProps) => {
  const [mode, setMode] = useState<UnlockMode>('passphrase');
  const { unlockWithPassphrase, unlockWithRecoveryToken, isRecovering } =
    useKeyBundleUnlock(userId);

  const passphraseForm = useMediaEditForm<
    EnterPassphraseInput,
    EnterPassphraseInput
  >({
    schema: enterPassphraseSchema,
    defaultValues: { passphrase: '' },
    completenessRules: [],
  });

  const recoveryForm = useMediaEditForm<
    RecoveryTokenInput,
    RecoveryTokenInput
  >({
    schema: recoveryTokenSchema,
    defaultValues: { recoveryToken: '' },
    completenessRules: [],
  });

  const onSubmitPassphrase = passphraseForm.submit(async (data) => {
    if (!keyBundle) return;
    try {
      const privateKey = await unlockWithPassphrase(
        keyBundle,
        data.passphrase
      );
      passphraseForm.reset({ passphrase: '' });
      onKeyReady(privateKey);
      onClose();
    } catch {
      passphraseForm.setError('passphrase', {
        message: 'Incorrect passphrase. Try again.',
      });
    }
  });

  const onSubmitRecovery = recoveryForm.submit(async (data) => {
    try {
      const privateKey = await unlockWithRecoveryToken(data.recoveryToken);
      recoveryForm.reset({ recoveryToken: '' });
      onKeyReady(privateKey);
      onClose();
    } catch (error) {
      recoveryForm.setError('recoveryToken', {
        message: getApiErrorMessage(error, 'Incorrect recovery code.'),
      });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlock secure messaging">
      {mode === 'passphrase' ? (
        <>
          <p className="mb-4 text-sm text-text-secondary">
            {hasPassword
              ? 'Enter your account password to unlock your conversations on this device.'
              : 'Enter your messaging passphrase to unlock your conversations on this device.'}
          </p>

          <form onSubmit={onSubmitPassphrase}>
            <PassphraseField
              label={hasPassword ? 'Account password' : 'Messaging passphrase'}
              autoComplete="current-password"
              {...passphraseForm.register('passphrase')}
              error={passphraseForm.formState.errors.passphrase?.message}
            />

            <Button type="submit" className="w-full">
              Unlock messaging
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-1.5 text-center text-xs text-text-muted">
            <button
              type="button"
              onClick={() => setMode('recover')}
              className="font-medium text-primary hover:underline"
            >
              {hasPassword
                ? 'Forgot your password? Recover via email'
                : 'Forgot your passphrase? Recover via email'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="hover:underline"
            >
              Reset messaging key instead
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-text-secondary">
            Paste the recovery code from the messaging email you received
            when you set up or last reset your key.
          </p>

          <form onSubmit={onSubmitRecovery}>
            <div className="mb-6">
              <p className="mb-2.5 text-sm font-medium text-text-secondary">
                Recovery code
              </p>
              <textarea
                rows={3}
                aria-invalid={!!recoveryForm.formState.errors.recoveryToken}
                className={`w-full resize-none rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors ${
                  recoveryForm.formState.errors.recoveryToken
                    ? 'border-error'
                    : 'border-border focus:border-primary'
                }`}
                {...recoveryForm.register('recoveryToken')}
              />
              {recoveryForm.formState.errors.recoveryToken && (
                <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
                  {recoveryForm.formState.errors.recoveryToken.message}
                </p>
              )}
            </div>

            <Button type="submit" isLoading={isRecovering} className="w-full">
              Recover messaging key
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode('passphrase')}
              className="text-xs font-medium text-primary hover:underline"
            >
              Back to passphrase entry
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default KeyUnlockModal;
