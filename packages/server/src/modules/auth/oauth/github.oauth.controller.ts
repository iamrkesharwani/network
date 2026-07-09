import type { Request, Response } from 'express';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  GITHUB_OAUTH_STATE_COOKIE_NAME,
} from '@network/shared';
import { env } from '../../../core/env/env.js';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { generateState } from 'arctic';
import { github } from '../../../core/config/oauth.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { handleOAuthUser } from '../services/auth.oauth.service.js';
import { setCsrfCookie } from '../../../core/middleware/csrf.middleware.js';
import { cookieOptions, stateCookieOptions } from './oauth.cookies.js';

export const githubRedirect = asyncHandler(
  async (_req: Request, res: Response) => {
    const state = generateState();
    const url = github.createAuthorizationURL(state, [
      'read:user',
      'user:email',
    ]);
    res.cookie(GITHUB_OAUTH_STATE_COOKIE_NAME, state, stateCookieOptions);
    res.redirect(url.toString());
  }
);

export const githubCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies[GITHUB_OAUTH_STATE_COOKIE_NAME];

    res.clearCookie(GITHUB_OAUTH_STATE_COOKIE_NAME);

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

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookieOptions);

    setCsrfCookie(res);

    res.redirect(`${env.CLIENT_URL}/oauth/callback?success=true`);
  }
);
