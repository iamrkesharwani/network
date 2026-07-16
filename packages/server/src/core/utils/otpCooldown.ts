import { redisClient } from '../config/redis.js';
import { OTP_REQUEST_COOLDOWN_SECONDS } from '@network/shared';

export const tryStartOtpCooldown = async (
  purpose: 'email_verify' | 'pwd_reset' | 'email_change',
  identifier: string
): Promise<boolean> => {
  const cooldownKey = `otp_cooldown:${purpose}:${identifier}`;

  const setResult = await redisClient.set(
    cooldownKey,
    '1',
    'EX',
    OTP_REQUEST_COOLDOWN_SECONDS,
    'NX'
  );

  return setResult !== null;
};
