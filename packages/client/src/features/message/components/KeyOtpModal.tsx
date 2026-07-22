import { useEffect, useRef, useState } from 'react';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import { otpConfirmSchema, type OtpConfirmInput } from '../passphrase.schema';
import {
  useRequestKeyOtpMutation,
  useConfirmKeyOtpMutation,
} from '../keyBundleApi';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';

interface KeyOtpModalProps {
  isOpen: boolean;
  onVerified: () => void;
}

const KeyOtpModal = ({ isOpen, onVerified }: KeyOtpModalProps) => {
  const [requestOtp, { isLoading: isRequesting }] = useRequestKeyOtpMutation();
  const [confirmOtp, { isLoading: isConfirming }] = useConfirmKeyOtpMutation();
  const [requestError, setRequestError] = useState<string | null>(null);
  const hasSentRef = useRef(false);

  const {
    register,
    reset,
    formState: { errors },
    submit,
    setError,
  } = useMediaEditForm<OtpConfirmInput, OtpConfirmInput>({
    schema: otpConfirmSchema,
    defaultValues: { otp: '' },
    completenessRules: [],
  });

  const sendCode = async () => {
    setRequestError(null);
    try {
      await requestOtp().unwrap();
    } catch (error) {
      setRequestError(getApiErrorMessage(error, 'Failed to send code.'));
    }
  };

  useEffect(() => {
    if (isOpen && !hasSentRef.current) {
      hasSentRef.current = true;
      void sendCode();
    }
    if (!isOpen) {
      hasSentRef.current = false;
      reset({ otp: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = submit(async (data) => {
    try {
      await confirmOtp(data).unwrap();
      reset({ otp: '' });
      onVerified();
    } catch (error) {
      setError('otp', {
        message: getApiErrorMessage(error, 'Incorrect code. Try again.'),
      });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Verify it's you
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        This device hasn't unlocked messaging before. We've sent a
        verification code to your email — enter it below to continue.
      </p>

      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <p className="mb-2.5 text-sm font-medium text-text-secondary">
            Verification code
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-invalid={!!errors.otp}
            className={`w-full rounded-lg border bg-surface-raised px-3.5 py-2.5 text-sm font-medium text-text-primary outline-none transition-colors ${
              errors.otp
                ? 'border-error'
                : 'border-border focus:border-primary'
            }`}
            {...register('otp')}
          />
          {errors.otp && (
            <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
              {errors.otp.message}
            </p>
          )}
        </div>

        {requestError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {requestError}
          </p>
        )}

        <Button type="submit" isLoading={isConfirming} className="w-full">
          Verify
        </Button>

        <button
          type="button"
          onClick={sendCode}
          disabled={isRequesting}
          className="mt-3 w-full text-center text-xs text-text-muted hover:text-text-primary hover:underline"
        >
          Resend code
        </button>
      </form>
    </Modal>
  );
};

export default KeyOtpModal;
