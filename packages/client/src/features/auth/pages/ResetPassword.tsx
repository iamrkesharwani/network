import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  completeResetPasswordSchema,
  maskEmail,
  SITE_NAME,
  CLIENT_ROUTES,
  type ApiErrorResponse,
  type CompleteResetPasswordInput,
} from '@network/shared';
import { useResetPasswordMutation } from '../authApi';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import OtpInput from '../components/OtpInput';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import SiteLogo from '../../../public/Logo.svg?react';
import { useToast } from '../../../shared/hooks/useToast';

const ResetPassword = () => {
  usePageTitle('Reset Password');
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const email = location.state?.email as string | undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteResetPasswordInput>({
    resolver: zodResolver(completeResetPasswordSchema),
    defaultValues: { email: email ?? '', otp: '', newPassword: '' },
  });

  if (!email) {
    return <Navigate to={CLIENT_ROUTES.FORGOT_PASSWORD} replace />;
  }

  const otp = watch('otp');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword(data).unwrap();
      addToast('Password reset successfully. Please sign in.', 'success');
      navigate(CLIENT_ROUTES.LOGIN, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: ApiErrorResponse })?.data?.error?.message ??
        'Could not reset password. Please try again.';
      addToast(msg, 'error');
    }
  });

  return (
    <AuthLayout>
      <div className="w-full max-w-95 flex flex-col items-center text-center">
        <div className="flex justify-center mb-8 gap-2">
          <SiteLogo aria-hidden="true" className="w-7" />
          <div className="font-display font-bold text-lg tracking-[0.22em] uppercase text-[--color-text-muted]">
            {SITE_NAME}
          </div>
        </div>

        <h1 className="font-display font-extrabold text-[clamp(1.9rem,6vw,2.6rem)] leading-none tracking-[-0.01em] uppercase mb-10">
          Reset Password<span className="text-[--color-primary]">.</span>
        </h1>

        <p className="text-[0.9rem] text-[--color-text-muted] mb-6">
          Enter the code sent to <br />
          <span className="text-white font-medium">{maskEmail(email)}</span>{' '}
          along with your new password.
        </p>

        <form
          onSubmit={onSubmit}
          className="w-full flex flex-col pt-4"
          noValidate
        >
          <input type="hidden" {...register('email')} />

          <OtpInput
            label="6-Digit OTP"
            value={otp}
            onChange={(value) =>
              setValue('otp', value, { shouldValidate: true })
            }
            error={errors.otp?.message}
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
            className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mt-6 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="register-line mt-4 text-[0.8rem] text-[--color-text-muted]">
          Remember your password?{' '}
          <Link
            to={CLIENT_ROUTES.LOGIN}
            className="text-[--color-text-primary] font-semibold no-underline pb-px transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
