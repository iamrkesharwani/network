import { useState } from 'react';
import type { MessagePinLength } from '@network/shared';
import { MESSAGE_PIN_LENGTHS } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import { pinSetupSchema, type PinSetupInput } from '../passphrase.schema';
import { useMessagingPinLock } from '../hooks/useMessagingPinLock';
import { dismissPinNudge, optOutPinNudge } from '../pinLockStore';
import PassphraseField from './PassphraseField';

type SetupStep = 'nudge' | 'choose-length' | 'enter';

interface PinSetupModalProps {
  isOpen: boolean;
  userId: string;
  privateKey: CryptoKey | null;
  onClose: () => void;
  onConfigured: () => void;
}

const PinSetupModal = ({
  isOpen,
  userId,
  privateKey,
  onClose,
  onConfigured,
}: PinSetupModalProps) => {
  const [step, setStep] = useState<SetupStep>('nudge');
  const [length, setLength] = useState<MessagePinLength>(6);
  const { setupPin } = useMessagingPinLock(userId);

  const {
    register,
    reset,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<PinSetupInput, PinSetupInput>({
    schema: pinSetupSchema(length),
    defaultValues: { pin: '', confirmPin: '' },
    completenessRules: [],
  });

  const handleNotNow = () => {
    dismissPinNudge(userId);
    setStep('nudge');
    onClose();
  };

  const handleDontAskAgain = () => {
    optOutPinNudge(userId);
    setStep('nudge');
    onClose();
  };

  const onSubmit = submit(async (data) => {
    if (!privateKey) return;
    await setupPin(privateKey, data.pin, length);
    reset({ pin: '', confirmPin: '' });
    setStep('nudge');
    onConfigured();
  });

  if (step === 'nudge') {
    return (
      <Modal isOpen={isOpen} onClose={handleNotNow} title="Add a PIN lock?">
        <p className="mb-6 text-sm text-text-secondary">
          Add a PIN to protect your conversations from anyone else who picks
          up this device while you're signed in. This only applies here — it
          isn't sent anywhere and doesn't replace your messaging passphrase.
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={() => setStep('choose-length')} className="w-full">
            Set up a PIN
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button variant="ghost" size="sm" onClick={handleNotNow}>
              Not now
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDontAskAgain}>
              Don't ask again
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (step === 'choose-length') {
    return (
      <Modal isOpen={isOpen} onClose={handleNotNow} title="Choose PIN length">
        <div className="mb-6 flex gap-2">
          {MESSAGE_PIN_LENGTHS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLength(option)}
              className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                length === option
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary'
              }`}
            >
              {option} digits
            </button>
          ))}
        </div>

        <Button onClick={() => setStep('enter')} className="w-full">
          Continue
        </Button>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleNotNow} title="Set your PIN">
      <form onSubmit={onSubmit}>
        <PassphraseField
          label={`${length}-digit PIN`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={length}
          {...register('pin')}
          error={errors.pin?.message}
        />

        <PassphraseField
          label="Confirm PIN"
          inputMode="numeric"
          autoComplete="off"
          maxLength={length}
          {...register('confirmPin')}
          error={errors.confirmPin?.message}
        />

        {submitError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" className="w-full">
          Set PIN
        </Button>
      </form>
    </Modal>
  );
};

export default PinSetupModal;
