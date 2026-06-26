import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/components/ToastContainer';
import { useForgotPasswordMutation } from '../authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import {
  requestResetPasswordSchema,
  SITE_NAME,
  type ApiErrorResponse,
  type RequestResetPasswordInput,
} from '@network/shared';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(requestResetPasswordSchema) });

  const onSubmit = async (data: RequestResetPasswordInput) => {
    try {
      await forgotPassword(data).unwrap();
      addToast('Reset instructions sent to your email.', 'success');
      navigate('/reset-password', { state: { email: data.email } });
    } catch (error: unknown) {
      const msg =
        (error as { data?: ApiErrorResponse })?.data?.error?.message ??
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
          Recover Account<span className="text-[--color-primary]">.</span>
        </h1>

        <div className="w-full flex flex-col">
          <p className="text-[0.85rem] text-[--color-text-muted] mb-6">
            Enter your email address and we will send you a one time code to reset your
            password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col"
            noValidate
          >
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mt-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send one time code'}
            </button>
          </form>
        </div>

        <p className="register-line mt-4 text-[0.8rem] text-[--color-text-muted]">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-[--color-text-primary] font-semibold no-underline pb-px transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
