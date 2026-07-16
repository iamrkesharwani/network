import { useState } from 'react';
import { changePasswordSchema, type ChangePasswordInput } from '@network/shared';
import { useChangePasswordMutation } from '../../../auth/authApi';
import { useMediaEditForm } from '../../../upload/hooks/useMediaEditForm';
import FloatingInput from '../../../upload/components/FloatingInput';
import Button from '../../../../shared/ui/primitives/Button';

const SecurityTab = () => {
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
        <FloatingInput
          label="Current password"
          type="password"
          autoComplete="current-password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
        />

        <FloatingInput
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

export default SecurityTab;
