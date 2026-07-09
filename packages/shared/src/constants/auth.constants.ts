export const OTP_MAX_ATTEMPTS = 5;
export const OTP_REQUEST_COOLDOWN_SECONDS = 60;
export const CSRF_EXEMPT_PATHS = ['/auth/refresh', '/auth/logout'];
export const RESEND_COOLDOWN = 60;
export const AUTH_PROVIDERS = ['local', 'google', 'github'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const AUTH_ICONS = {
  GOOGLE: {
    PATH: 'M12 10.8v3.6h5.04c-.22 1.28-1.6 3.76-5.04 3.76-3.04 0-5.52-2.52-5.52-5.6s2.48-5.6 5.52-5.6c1.74 0 2.9.74 3.56 1.38l2.42-2.34C16.62 4.62 14.5 3.6 12 3.6 6.96 3.6 2.88 7.68 2.88 12.7s4.08 9.1 9.12 9.1c5.26 0 8.76-3.7 8.76-8.92 0-.6-.06-1.06-.14-1.52H12z',
    FILL: '#EA4335',
    VIEWBOX: '0 0 24 24',
  },
  GITHUB: {
    PATH: 'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.4-5.4-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.6 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
    VIEWBOX: '0 0 24 24',
  },
  EMAIL: {
    RECT: { x: '2', y: '4', width: '20', height: '16', rx: '2' },
    PATH: 'm2 7 10 7 10-7',
    VIEWBOX: '0 0 24 24',
  },
} as const;
