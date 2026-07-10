import { CLIENT_ROUTES } from '@network/shared';

export const buildProfilePath = (username: string): string =>
  CLIENT_ROUTES.PROFILE.replace(':username', username);
