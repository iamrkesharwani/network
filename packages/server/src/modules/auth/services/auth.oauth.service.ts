import * as authRepository from '../auth.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../../utils/token.js';
import { generateUniqueUsername } from '../../../utils/username.js';
import { ApiError } from '../../../utils/ApiError.js';
import type { OAuthUserPayload } from '../auth.types.js';

export const handleOAuthUser = async (payload: OAuthUserPayload) => {
  let user = await authRepository.findByProviderId(
    payload.provider,
    payload.providerId
  );

  if (user) {
    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);
    return { user, accessToken, refreshToken };
  }

  const existingUser = await authRepository.findByEmail(payload.email);

  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      throw new ApiError(
        409,
        'CONFLICT',
        'An account with this email already exists but is not verified. Please verify your email before signing in with this provider.'
      );
    }

    user = await authRepository.linkOAuthProvider(
      existingUser,
      payload.provider,
      payload.providerId
    );

    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  const username = await generateUniqueUsername(
    payload.name,
    authRepository.existsByUsername
  );

  user = await authRepository.createOAuthUser({
    name: payload.name,
    username,
    email: payload.email,
    avatarUrl: payload.avatarUrl ?? '',
    provider: payload.provider,
    providerId: payload.providerId,
  });

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);
  return { user, accessToken, refreshToken };
};
