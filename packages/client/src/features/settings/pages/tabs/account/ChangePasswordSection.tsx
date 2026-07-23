import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@network/shared';
import Button from '../../../../../shared/ui/primitives/Button';
import { useMediaEditForm } from '../../../../upload/hooks/useMediaEditForm';
import BorderedInput from '../../../components/general/BorderedInput';
import { useChangePasswordMutation } from '../../../../auth/authApi';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import {
  useLazyGetMyKeyBundleQuery,
  usePublishKeyBundleMutation,
  useRewrapKeyHistoryMutation,
} from '../../../../message/keyBundleApi';
import {
  wrapPrivateKey,
  generateRecoveryToken,
} from '../../../../message/keyManager';
import { getCachedHistoricalKeyRing } from '../../../../message/localKeyStore';
import { useState } from 'react';

const ChangePasswordSection = () => {
  const user = useAppSelector((state) => state.auth.user);
  const privateKey = useAppSelector((state) => state.messageKey.privateKey);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [fetchKeyBundle] = useLazyGetMyKeyBundleQuery();
  const [publishKeyBundle] = usePublishKeyBundleMutation();
  const [rewrapKeyHistory] = useRewrapKeyHistoryMutation();
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

  const rewrapMessagingKey = async (newPassword: string): Promise<void> => {
    if (!user?.hasPassword || !privateKey) return;

    try {
      const keyBundle = await fetchKeyBundle().unwrap();
      const wrapped = await wrapPrivateKey(privateKey, newPassword);
      const recoveryToken = generateRecoveryToken();
      const recoveryWrapped = await wrapPrivateKey(privateKey, recoveryToken);

      await publishKeyBundle({
        publicKey: keyBundle.data.publicKey,
        wrappedPrivateKey: wrapped.wrappedPrivateKey,
        wrapIv: wrapped.wrapIv,
        wrapSalt: wrapped.wrapSalt,
        pbkdf2Iterations: wrapped.pbkdf2Iterations,
        recoveryWrappedPrivateKey: recoveryWrapped.wrappedPrivateKey,
        recoveryWrapIv: recoveryWrapped.wrapIv,
        recoveryWrapSalt: recoveryWrapped.wrapSalt,
        recoveryPbkdf2Iterations: recoveryWrapped.pbkdf2Iterations,
        recoveryToken,
      }).unwrap();

      // Retired keys from past rotations are wrapped the same way the
      // active key is - if this device has any cached, re-wrap them under
      // the new password too so they don't go stale and become undecryptable
      // on this device after the password changes.
      const historicalKeys = await getCachedHistoricalKeyRing(user.id);
      if (historicalKeys.size > 0) {
        const entries = await Promise.all(
          Array.from(historicalKeys.entries()).map(
            async ([keyVersion, historicalKey]) => {
              const rewrapped = await wrapPrivateKey(historicalKey, newPassword);
              return { keyVersion, ...rewrapped };
            }
          )
        );
        await rewrapKeyHistory({ entries }).unwrap();
      }
    } catch {
      // Best-effort only — messaging isn't unlocked/reachable right now.
      // The account password change must never be blocked by this; if it's
      // skipped, the normal OTP + recovery flow covers it next time.
    }
  };

  const onSubmit = submit(async (data) => {
    setSuccessMessage(null);
    await rewrapMessagingKey(data.newPassword);
    await changePassword(data).unwrap();
    setSuccessMessage('Password updated successfully.');
    reset({ oldPassword: '', newPassword: '' });
  });

  return (
    <div>
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

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
