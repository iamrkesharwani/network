import { useState } from 'react';
import { changePasswordSchema, type ChangePasswordInput } from '@network/shared';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import {
  useChangePasswordMutation,
  useRequestAddPasswordMutation,
  useConfirmAddPasswordMutation,
} from '../../../auth/authApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import BorderedInput from '../../components/BorderedInput';
import Button from '../../../../shared/ui/primitives/Button';

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
    <div className="max-w-lg">
      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Add a password
      </h3>
      <p className="mb-4 text-sm text-text-secondary">
        You signed in with Google and don't have a password yet. Add one so
        you can also log in directly with your email.
      </p>

      {step === 'intro' && (
        <Button type="button" isLoading={isRequesting} onClick={handleSendCode}>
          Send verification code
        </Button>
      )}

      {step === 'confirm' && (
        <>
          <BorderedInput
            label="Verification code"
            placeholder="6-digit code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
          <BorderedInput
            label="New password"
            type="password"
            placeholder="Enter a new password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <Button type="button" isLoading={isConfirming} onClick={handleConfirm}>
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

const ChangePasswordSection = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    reset,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<ChangePasswordInput, ChangePasswordInput>({
    schema: changePasswordSchema,
    defaultValues: { oldPassword: '', newPassword: '' },
    completenessRules: [],
  });

  const onSubmit = submit(async (data) => {
    setSuccessMessage(null);
    await changePassword(data).unwrap();
    setSuccessMessage('Password updated successfully.');
    reset({ oldPassword: '', newPassword: '' });
  });

  return (
    <div className="max-w-lg">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Change password
      </h3>

      <form onSubmit={onSubmit}>
        <BorderedInput
          label="Current password"
          type="password"
          autoComplete="current-password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
        />

        <BorderedInput
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />

        {submitError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        {successMessage && (
          <p className="mb-3 text-sm text-success" role="status">
            {successMessage}
          </p>
        )}

        <Button type="submit" isLoading={isLoading}>
          Update password
        </Button>
      </form>
    </div>
  );
};

const SecurityTab = () => {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;

  return user.hasPassword ? <ChangePasswordSection /> : <AddPasswordSection />;
};

export default SecurityTab;
