import { redisClient } from '../config/redis.js';
import { OTP_REQUEST_COOLDOWN_SECONDS } from '@network/shared';

export const tryStartOtpCooldown = async (
  purpose: 'email_verify' | 'pwd_reset',
  email: string
): Promise<boolean> => {
  const cooldownKey = `otp_cooldown:${purpose}:${email}`;

  const setResult = await redisClient.set(
    cooldownKey,
    '1',
    'EX',
    OTP_REQUEST_COOLDOWN_SECONDS,
    'NX'
  );

  return setResult !== null;
};
