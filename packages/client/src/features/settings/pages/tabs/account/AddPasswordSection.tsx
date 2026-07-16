import { useState } from 'react';
import {
  useConfirmAddPasswordMutation,
  useRequestAddPasswordMutation,
} from '../../../../auth/authApi';
import Button from '../../../../../shared/ui/primitives/Button';
import OtpInput from '../../../../auth/components/OtpInput';
import BorderedInput from '../../../components/general/BorderedInput';

const AddPasswordSection = () => {
  const [step, setStep] = useState<'intro' | 'confirm'>('intro');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [requestAddPassword, { isLoading: isRequesting }] =
    useRequestAddPasswordMutation();
  const [confirmAddPassword, { isLoading: isConfirming }] =
    useConfirmAddPasswordMutation();

  const handleSendCode = async () => {
    setError(null);
    try {
      await requestAddPassword().unwrap();
      setStep('confirm');
    } catch {
      setError('Could not send the verification code. Please try again.');
    }
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await confirmAddPassword({ otp, newPassword }).unwrap();
    } catch {
      setError('Incorrect code, or the password does not meet requirements.');
    }
  };

  return (
    <div>
      {step === 'intro' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              Add a password
            </h3>
            <p className="text-sm text-text-secondary sm:max-w-md">
              You signed in with Google and don't have a password yet. Add one
              so you can also log in directly with your email.
            </p>
          </div>
          <Button
            type="button"
            isLoading={isRequesting}
            onClick={handleSendCode}
            className="w-full shrink-0 sm:w-auto"
          >
            Send verification code
          </Button>
        </div>
      ) : (
        <>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            Add a password
          </h3>
          <p className="mb-4 text-sm text-text-secondary">
            You signed in with Google and don't have a password yet. Add one so
            you can also log in directly with your email.
          </p>

          <OtpInput label="Verification code" value={otp} onChange={setOtp} />
          <BorderedInput
            label="New password"
            type="password"
            placeholder="Enter a new password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <Button
            type="button"
            isLoading={isConfirming}
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            Set password
          </Button>
        </>
      )}

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddPasswordSection;
