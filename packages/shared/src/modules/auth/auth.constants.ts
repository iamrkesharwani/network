import { FIFTEEN_MINUTES_SECONDS } from '../../constants/time.constants.js';

export const OTP_MAX_ATTEMPTS = 5;
export const OTP_REQUEST_COOLDOWN_SECONDS = 60;
export const CSRF_EXEMPT_PATHS = ['/auth/refresh'];
export const WEBHOOK_ROUTE_PREFIX = '/webhook';
export const RESEND_COOLDOWN = 60;
export const LOGIN_LOCKOUT_MAX_ATTEMPTS = 10;
export const LOGIN_LOCKOUT_DURATION_SECONDS = FIFTEEN_MINUTES_SECONDS;
export const AUTH_PROVIDERS = ['local', 'google'] as const;
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const CSRF_COOKIE_NAME = '_csrf';
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'google_oauth_state';
export const GOOGLE_CODE_VERIFIER_COOKIE_NAME = 'google_code_verifier';
export const ACCESS_TOKEN_EXPIRY = '15m';
export const OTP_VERIFICATION_TTL_SECONDS = FIFTEEN_MINUTES_SECONDS;
export const OTP_CODE_MIN = 100000;
export const OTP_CODE_MAX = 1000000;
export const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/request-password-reset',
  '/auth/reset-password',
  '/auth/send-verification',
  '/auth/forgot-password',
];
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$dQJHQO0aS3S1x8CGldfxgQ$YsxGqXSBd8KbVo/RONXSR2+JTIma/z2XpBpq3SuYcwA';

export const AUTH_ICONS = {
  GOOGLE: {
    PATH: 'M12 10.8v3.6h5.04c-.22 1.28-1.6 3.76-5.04 3.76-3.04 0-5.52-2.52-5.52-5.6s2.48-5.6 5.52-5.6c1.74 0 2.9.74 3.56 1.38l2.42-2.34C16.62 4.62 14.5 3.6 12 3.6 6.96 3.6 2.88 7.68 2.88 12.7s4.08 9.1 9.12 9.1c5.26 0 8.76-3.7 8.76-8.92 0-.6-.06-1.06-.14-1.52H12z',
    FILL: '#EA4335',
    VIEWBOX: '0 0 24 24',
  },
  EMAIL: {
    RECT: { x: '2', y: '4', width: '20', height: '16', rx: '2' },
    PATH: 'm2 7 10 7 10-7',
    VIEWBOX: '0 0 24 24',
  },
} as const;
