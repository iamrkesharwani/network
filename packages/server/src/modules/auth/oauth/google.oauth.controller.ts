import type { Request, Response } from 'express';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  GOOGLE_CODE_VERIFIER_COOKIE_NAME,
} from '@network/shared';
import { env } from '../../../core/env/env.js';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { decodeIdToken, generateCodeVerifier, generateState } from 'arctic';
import { google } from '../../../core/config/oauth.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { handleOAuthUser } from '../services/auth.oauth.service.js';
import { setCsrfCookie } from '../../../core/middleware/csrf.middleware.js';
import { cookieOptions, stateCookieOptions } from './oauth.cookies.js';

export const googleRedirect = asyncHandler(
  async (_req: Request, res: Response) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      'openid',
      'profile',
      'email',
    ]);

    res.cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, stateCookieOptions);
    res.cookie(GOOGLE_CODE_VERIFIER_COOKIE_NAME, codeVerifier, stateCookieOptions);
    res.redirect(url.toString());
  }
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies[GOOGLE_OAUTH_STATE_COOKIE_NAME];
    const storedVerifier = req.cookies[GOOGLE_CODE_VERIFIER_COOKIE_NAME];

    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME);
    res.clearCookie(GOOGLE_CODE_VERIFIER_COOKIE_NAME);

    if (
      !code ||
      !state ||
      !storedState ||
      !storedVerifier ||
      state !== storedState
    ) {
      throw new ApiError(400, 'BAD_REQUEST', 'Invalid OAuth state');
    }

    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const claims = decodeIdToken(tokens.idToken()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
    };

    let result;
    try {
      result = await handleOAuthUser({
        provider: 'google',
        providerId: claims.sub,
        email: claims.email,
        name: claims.name,
        avatarUrl: claims.picture,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.redirect(
          `${env.CLIENT_URL}/oauth/callback?error=${encodeURIComponent(error.message)}`
        );
      }
      throw error;
    }

    const { refreshToken } = result;

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);

    setCsrfCookie(res);

    res.redirect(`${env.CLIENT_URL}/oauth/callback?success=true`);
  }
);
