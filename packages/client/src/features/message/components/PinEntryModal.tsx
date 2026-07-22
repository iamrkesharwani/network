import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import { pinEntrySchema, type PinEntryInput } from '../passphrase.schema';
import { useMessagingPinLock } from '../hooks/useMessagingPinLock';
import PassphraseField from './PassphraseField';

interface PinEntryModalProps {
  isOpen: boolean;
  userId: string;
  pinLength: 4 | 6;
  onUnlocked: (privateKey: CryptoKey) => void;
  onForgotPin: () => void;
}

const PinEntryModal = ({
  isOpen,
  userId,
  pinLength,
  onUnlocked,
  onForgotPin,
}: PinEntryModalProps) => {
  const { unlockWithPin } = useMessagingPinLock(userId);

  const {
    register,
    reset,
    formState: { errors },
    submit,
    setError,
  } = useMediaEditForm<PinEntryInput, PinEntryInput>({
    schema: pinEntrySchema(pinLength),
    defaultValues: { pin: '' },
    completenessRules: [],
  });

  const onSubmit = submit(async (data) => {
    try {
      const privateKey = await unlockWithPin(data.pin);
      reset({ pin: '' });
      onUnlocked(privateKey);
    } catch {
      setError('pin', { message: 'Incorrect PIN. Try again.' });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Enter your PIN
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Enter your {pinLength}-digit PIN to unlock messaging on this device.
      </p>

      <form onSubmit={onSubmit}>
        <PassphraseField
          label="PIN"
          inputMode="numeric"
          autoComplete="off"
          maxLength={pinLength}
          {...register('pin')}
          error={errors.pin?.message}
        />

        <Button type="submit" className="w-full">
          Unlock
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onForgotPin}
          className="text-xs text-text-muted hover:text-text-primary hover:underline"
        >
          Forgot your PIN? Remove it from this device
        </button>
      </div>
    </Modal>
  );
};

export default PinEntryModal;
