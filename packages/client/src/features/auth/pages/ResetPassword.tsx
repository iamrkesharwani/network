import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Field from '../components/Field';
import OtpInput from '../components/OtpInput';
import { useToast } from '../../../shared/components/ToastContainer';
import { useResetPasswordMutation } from '../authApi';
import { useForm, Controller } from 'react-hook-form';
import {
  completeResetPasswordSchema,
  SITE_NAME,
  maskEmail,
  type CompleteResetPasswordInput,
  type ApiErrorResponse,
} from '@network/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const defaultEmail = (location.state as { email?: string })?.email;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompleteResetPasswordInput>({
    resolver: zodResolver(completeResetPasswordSchema),
    defaultValues: { email: defaultEmail || '' },
  });

  if (!defaultEmail) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = async (data: CompleteResetPasswordInput) => {
    try {
      await resetPassword(data).unwrap();
      addToast('Password reset successfully. You can now log in.', 'success');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: ApiErrorResponse })?.data?.error?.message ??
        'Something went wrong. Try again.';
      addToast(msg, 'error');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-95 flex flex-col items-center text-center">
        <div className="font-display font-bold text-[0.7rem] tracking-[0.22em] uppercase text-[--color-text-muted] mb-8">
          {SITE_NAME}
        </div>

        <h1 className="font-display font-extrabold text-[clamp(1.9rem,6vw,2.6rem)] leading-none tracking-[-0.01em] uppercase mb-10">
          Reset Password<span className="text-[--color-primary]">.</span>
        </h1>

        <div className="w-full flex flex-col">
          <p className="text-[0.85rem] text-[--color-text-muted] mb-6">
            Code sent to{' '}
            <span className="font-semibold text-[--color-text-primary]">
              {maskEmail(defaultEmail)}
            </span>
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col"
            noValidate
          >
            <input type="hidden" {...register('email')} />

            <Controller
              name="otp"
              control={control}
              render={({ field: { value, onChange } }) => (
                <OtpInput
                  label="6-Digit OTP"
                  value={value || ''}
                  onChange={onChange}
                  error={errors.otp?.message}
                />
              )}
            />

            <Field
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mt-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Set New Password'}
            </button>
          </form>
        </div>

        <p className="register-line mt-4 text-[0.8rem] text-[--color-text-muted]">
          <Link
            to="/login"
            className="text-[--color-text-primary] font-semibold no-underline pb-px transition-colors"
          >
            Back to Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
