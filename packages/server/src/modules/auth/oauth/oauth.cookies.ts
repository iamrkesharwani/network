import { SEVEN_DAYS_MS, TEN_MINUTES_MS } from '@network/shared';
import { env } from '../../../core/env/env.js';

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SEVEN_DAYS_MS,
};

export const stateCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: TEN_MINUTES_MS,
};
