import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/hooks/useToast';
import React, { useState, useEffect, useRef } from 'react';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import SiteLogo from '../../../public/Logo.svg?react';
import {
  useVerifyEmailMutation,
  useSendVerificationMutation,
} from '../authApi';
import {
  maskEmail,
  RESEND_COOLDOWN,
  SITE_NAME,
  CLIENT_ROUTES,
  type ApiErrorResponse,
} from '@network/shared';

const VerifyEmail = () => {
  usePageTitle('Verify Email');
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [sendVerification, { isLoading: isSending }] =
    useSendVerificationMutation();

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const email = location.state?.email as string | undefined;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      await verifyEmail({ email, otp }).unwrap();
      addToast('Email verified successfully!', 'success');
      navigate(CLIENT_ROUTES.FEED, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: ApiErrorResponse })?.data?.error?.message ??
        'Invalid verification code. Please try again.';
      addToast(msg, 'error');
    }
  };

  const onResend = async () => {
    if (cooldown > 0 || isSending) return;
    try {
      await sendVerification({ email }).unwrap();
      addToast('A new verification code has been sent.', 'success');
      setCooldown(RESEND_COOLDOWN);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      addToast('Could not resend code. Please try again.', 'error');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-95 flex flex-col items-center text-center">
        <Link to={'/'} className="flex justify-center mb-8 gap-2">
          <SiteLogo aria-hidden="true" className="w-7" />
          <div className="font-display font-bold text-lg tracking-[0.22em] uppercase text-[--color-text-muted]">
            {SITE_NAME}
          </div>
        </Link>

        <h1 className="font-display font-extrabold text-[clamp(1.9rem,6vw,2.6rem)] leading-none tracking-[-0.01em] uppercase mb-10">
          Verify Email<span className="text-[--color-primary]">.</span>
        </h1>

        <p className="text-[0.9rem] text-[--color-text-muted] mb-6">
          We sent a verification code to <br />
          <span className="text-white font-medium">{maskEmail(email)}</span>
        </p>

        <form onSubmit={onSubmit} className="w-full flex flex-col pt-4">
          <OtpInput label="6-Digit OTP" value={otp} onChange={setOtp} />

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mt-6 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying…' : 'Verify Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || isSending}
          className="text-[0.8rem] text-[--color-text-muted] bg-transparent border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isSending
            ? 'Sending…'
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : 'Resend code'}
        </button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
