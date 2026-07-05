import type { Request, Response } from 'express';
import { env } from '../../../env/env.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { decodeIdToken, generateCodeVerifier, generateState } from 'arctic';
import { google } from '../../../config/oauth.js';
import { ApiError } from '../../../utils/ApiError.js';
import { handleOAuthUser } from '../services/auth.oauth.service.js';
import { setCsrfCookie } from '../../../middleware/csrf.middleware.js';
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

    res.cookie('google_oauth_state', state, stateCookieOptions);
    res.cookie('google_code_verifier', codeVerifier, stateCookieOptions);
    res.redirect(url.toString());
  }
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies['google_oauth_state'];
    const storedVerifier = req.cookies['google_code_verifier'];

    res.clearCookie('google_oauth_state');
    res.clearCookie('google_code_verifier');

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

    res.cookie('refreshToken', refreshToken, cookieOptions);

    setCsrfCookie(res);

    res.redirect(`${env.CLIENT_URL}/oauth/callback?success=true`);
  }
);
