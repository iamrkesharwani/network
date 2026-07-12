import type { OAuthProvider } from '@network/shared';

export interface CreateLocalUserData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface OAuthUserPayload {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string | undefined;
}

export interface UpdateOAuthData {
  authProviders?: string[];
  googleId?: string;
}
