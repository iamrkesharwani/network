import { Link } from 'react-router-dom';
import React from 'react';
import Field from '../components/Field';
import { SITE_NAME, CLIENT_ROUTES } from '@network/shared';
import AuthLayout from '../components/AuthLayout';
import { EmailIcon, GoogleIcon } from '../components/AuthIcons';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import SiteLogo from '../../../public/Logo.svg?react';
import { useOAuthRedirect } from '../hooks/useOAuthRedirect';
import { useEntryDisclosure } from '../hooks/useEntryDisclosure';
import { useRegisterForm } from '../hooks/useRegisterForm';

const Register = () => {
  usePageTitle('Register');

  const { handleGoogleLogin } = useOAuthRedirect();
  const { register, setFocus, errors, isLoading, onSubmit } = useRegisterForm();
  const {
    entryCollapsed,
    formOpen,
    backVisible,
    emailEntryBtnRef,
    openEmailForm,
    closeEmailForm,
  } = useEntryDisclosure(() => setFocus('name'));

  const oauthBtn =
    'entry-btn w-full flex items-center justify-center gap-2.5 px-5 py-[0.825rem] ' +
    'rounded-[10px] border border-white/9 bg-[--color-surface-raised] ' +
    'text-[--color-text-primary] text-[0.9rem] font-medium tracking-[0.01em] cursor-pointer outline-none';

  const emailBtn =
    'entry-btn email-btn w-full flex items-center justify-center gap-2.5 px-5 py-[0.825rem] ' +
    'rounded-[10px] border border-white/9 bg-[--color-surface-raised] ' +
    'text-[--color-text-primary] text-[0.9rem] font-medium tracking-[0.01em] cursor-pointer outline-none';

  const entryStyle: React.CSSProperties = {
    maxHeight: entryCollapsed ? '0' : '400px',
    opacity: entryCollapsed ? '0' : '1',
    overflow: 'hidden',
    transition:
      'max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
  };

  const formStyle: React.CSSProperties = {
    maxHeight: formOpen ? '520px' : '0',
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
          Join the feed<span className="text-[--color-primary]">.</span>
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
            <EmailIcon /> Sign up with Email
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
              label="Name"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn relative w-full bg-transparent border border-white/9 text-[--color-text-primary] font-display font-bold text-[0.75rem] tracking-[0.15em] uppercase px-8 py-[0.9rem] rounded-full cursor-pointer overflow-hidden mt-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1 text-[0.7rem] text-[--color-text-muted] mt-1 mb-3">
            <Link
              to="/terms"
              className="px-2.5 py-1 rounded-full border border-white/9 hover:border-white/18 hover:text-[--color-text-primary] transition-colors duration-200 no-underline"
            >
              Terms
            </Link>
            <span className="opacity-30">·</span>
            <Link
              to="/privacy"
              className="px-2.5 py-1 rounded-full border border-white/9 hover:border-white/18 hover:text-[--color-text-primary] transition-colors duration-200 no-underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <button
          id="back-btn"
          type="button"
          onClick={closeEmailForm}
          aria-hidden={!backVisible}
          style={backStyle}
          className="back-link text-[0.8rem] text-[--color-text-muted] bg-transparent border-0 cursor-pointer mb-2"
        >
          ← Other sign-up options
        </button>

        <p className="register-line mt-8 text-[0.8rem] text-[--color-text-muted]">
          Already have an account?{' '}
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

export default Register;
