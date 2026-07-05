import type { Request, Response } from 'express';
import { env } from '../../../env/env.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { decodeIdToken, generateCodeVerifier, generateState } from 'arctic';
import { github, google } from '../../../config/oauth.js';
import { ApiError } from '../../../utils/ApiError.js';
import { handleOAuthUser } from '../services/auth.oauth.service.js';
import { setCsrfCookie } from '../../../middleware/csrf.middleware.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const stateCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 10 * 60 * 1000,
};

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

export const githubRedirect = asyncHandler(
  async (_req: Request, res: Response) => {
    const state = generateState();
    const url = github.createAuthorizationURL(state, [
      'read:user',
      'user:email',
    ]);
    res.cookie('github_oauth_state', state, stateCookieOptions);
    res.redirect(url.toString());
  }
);

export const githubCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies['github_oauth_state'];

    res.clearCookie('github_oauth_state');

    if (!code || !state || !storedState || state !== storedState) {
      throw new ApiError(400, 'BAD_REQUEST', 'Invalid OAuth state');
    }

    const tokens = await github.validateAuthorizationCode(code);
    const accessTokenValue = tokens.accessToken();

    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessTokenValue}` },
    });

    const profile = (await profileRes.json()) as {
      id: number;
      name: string;
      login: string;
      avatar_url?: string;
      email?: string | null;
    };

    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessTokenValue}` },
    });

    if (!emailsRes.ok) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'Failed to fetch GitHub emails. Ensure email access is granted.'
      );
    }

    const emails = await emailsRes.json();

    if (!Array.isArray(emails)) {
      throw new ApiError(
        500,
        'INTERNAL_SERVER_ERROR',
        'Unexpected response format from GitHub API'
      );
    }

    const primary = emails.find(
      (e: { email: string; primary: boolean; verified: boolean }) =>
        e.primary && e.verified
    );

    const email = primary?.email ?? null;

    if (!email) {
      throw new ApiError(
        400,
        'BAD_REQUEST',
        'No verified email found on your GitHub account'
      );
    }

    let result;
    try {
      result = await handleOAuthUser({
        provider: 'github',
        providerId: String(profile.id),
        email,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
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
