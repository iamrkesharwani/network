import { CLIENT_ROUTES, type ProfileTab } from '@network/shared';

export const buildProfilePath = (username: string): string =>
  CLIENT_ROUTES.PROFILE.replace(':username', username);

const TAB_ROUTES: Record<ProfileTab, string> = {
  videos: CLIENT_ROUTES.PROFILE_VIDEOS,
  shorts: CLIENT_ROUTES.PROFILE_SHORTS,
  posts: CLIENT_ROUTES.PROFILE_POSTS,
  stats: CLIENT_ROUTES.PROFILE_STATS,
  history: CLIENT_ROUTES.PROFILE_HISTORY,
  playlists: CLIENT_ROUTES.PROFILE_PLAYLISTS,
  saved: CLIENT_ROUTES.PROFILE_SAVED,
  jury: CLIENT_ROUTES.JURY_QUEUE,
  settings: CLIENT_ROUTES.SETTINGS,
};

export const buildProfileTabPath = (
  username: string,
  tab: ProfileTab
): string => TAB_ROUTES[tab].replace(':username', username);

export const buildFollowersPath = (username: string): string =>
  CLIENT_ROUTES.PROFILE_FOLLOWERS.replace(':username', username);

export const buildFollowingPath = (username: string): string =>
  CLIENT_ROUTES.PROFILE_FOLLOWING.replace(':username', username);
