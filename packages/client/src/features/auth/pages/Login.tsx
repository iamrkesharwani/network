import { Link } from 'react-router-dom';
import React from 'react';
import Field from '../components/Field';
import { SITE_NAME } from '@network/shared';
import AuthLayout from '../components/AuthLayout';
import { EmailIcon, GoogleIcon } from '../components/AuthIcons';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import SiteLogo from '../../../public/Logo.svg?react';
import { useOAuthRedirect } from '../hooks/useOAuthRedirect';
import { useEntryDisclosure } from '../hooks/useEntryDisclosure';
import { useLoginForm } from '../hooks/useLoginForm';

const Login = () => {
  usePageTitle('Login');

  const { handleGoogleLogin } = useOAuthRedirect();
  const { register, setFocus, errors, isLoading, onSubmit } = useLoginForm();
  const {
    entryCollapsed,
    formOpen,
    backVisible,
    emailEntryBtnRef,
    openEmailForm,
    closeEmailForm,
  } = useEntryDisclosure(() => setFocus('email'));

  const oauthBtn =
    'entry-btn w-full flex items-center justify-center gap-2.5 px-5 py-[0.825rem] rounded-[10px] border border-white/9 bg-[--color-surface-raised] text-[--color-text-primary] text-[0.9rem] font-medium tracking-[0.01em] cursor-pointer';

  const emailBtn =
    'entry-btn email-btn w-full flex items-center justify-center gap-2.5 px-5 py-[0.825rem] rounded-[10px] border border-white/9 bg-[--color-surface-raised] text-[--color-text-primary] text-[0.9rem] font-medium tracking-[0.01em] cursor-pointer';

  const entryStyle: React.CSSProperties = {
    maxHeight: entryCollapsed ? '0' : '400px',
    opacity: entryCollapsed ? '0' : '1',
    overflow: 'hidden',
    transition:
      'max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
  };

  const formStyle: React.CSSProperties = {
    maxHeight: formOpen ? '400px' : '0',
    opacity: formOpen ? '1' : '0',
    overflow: formOpen ? 'visible' : 'hidden',
    transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
  };

  const backStyle: React.CSSProperties = {
    opacity: backVisible ? '1' : '0',
    pointerEvents: backVisible ? 'auto' : 'none',
    transition: 'opacity 0.2s ease, color 0.2s ease',
  };

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
          Welcome back<span className="text-[--color-primary]">.</span>
        </h1>

        <div
          id="entry-group"
          aria-hidden={entryCollapsed}
          style={entryStyle}
          className="w-full flex flex-col gap-2.5"
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={oauthBtn}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3.5 w-full my-5">
            <div className="flex-1 h-px bg-white/9" />
            <span className="text-[0.7rem] tracking-widest uppercase text-[--color-text-muted]">
              or
            </span>
            <div className="flex-1 h-px bg-white/9" />
          </div>

          <button
            ref={emailEntryBtnRef}
            type="button"
            id="email-entry-btn"
            onClick={openEmailForm}
            className={emailBtn}
          >
            <EmailIcon /> Continue with Email
          </button>
        </div>

        <div
          id="email-form"
          aria-hidden={!formOpen}
          style={formStyle}
          className="w-full flex flex-col"
        >
          <form
            onSubmit={onSubmit}
            className="pt-6 w-full flex flex-col"
            noValidate
          >
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="text-right -mt-4 mb-5">
              <Link
                to="/forgot-password"
                className="forgot text-[0.78rem] text-[--color-text-muted] no-underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <button
          id="back-btn"
          type="button"
          onClick={closeEmailForm}
          aria-hidden={!backVisible}
          style={backStyle}
          className="back-link text-[0.8rem] text-[--color-text-muted] bg-transparent border-0 cursor-pointer mb-2"
        >
          ← Other sign-in options
        </button>

        <p className="register-line mt-8 text-[0.8rem] text-[--color-text-muted]">
          New here?{' '}
          <Link
            to="/register"
            className="text-[--color-text-primary] font-semibold no-underline pb-px transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
