import { type RouteObject } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import AppInitGate from './AppInitGate';
import RequireAuth from './RequireAuth';
import PageWrapper from '../layout/PageWrapper';
import MobileAppShell from '../layout/MobileAppShell';
import Login from '../../features/auth/pages/Login';
import Register from '../../features/auth/pages/Register';
import VerifyEmail from '../../features/auth/pages/VerifyEmail';
import GuestRoute from './GuestRoute';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import ResetPassword from '../../features/auth/pages/ResetPassword';
import OAuthCallback from '../../features/auth/pages/OAuthCallback';
import Feed from '../../features/feed/Feed';
import VideoWatch from '../../features/video/pages/VideoWatch';
import ShortsEntry from '../../features/short/pages/ShortsEntry';
import ShortWatch from '../../features/short/pages/ShortWatch';
import ShortsFeedPage from '../../features/short/pages/ShortsFeedPage';
import MessagesPage from '../../features/message/pages/MessagesPage';
import UploadHub from '../../features/upload/components/UploadHub';
import VideoUploadWizard from '../../features/video/form/VideoUploadWizard';
import ShortUploadWizard from '../../features/short/form/ShortUploadWizard';
import PostComposer from '../../features/post/form/PostComposer';
import PostsFeedPage from '../../features/post/pages/PostsFeedPage';
import PostWatch from '../../features/post/pages/PostWatch';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import PlaylistPage from '../../features/playlist/pages/PlaylistPage';
import FollowListPage from '../../features/follow/pages/FollowListPage';
import FollowRequestsPage from '../../features/follow/pages/FollowRequestsPage';
import SettingsPage from '../../features/settings/pages/SettingsPage';
import SearchResultsPage from '../../features/search/pages/SearchResultsPage';
import JuryQueuePage from '../../features/jury/pages/JuryQueuePage';
import JuryCaseDetailPage from '../../features/jury/pages/JuryCaseDetailPage';
import AppealsPage from '../../features/jury/pages/AppealsPage';
import NotificationsPage from '../../features/notification/pages/NotificationsPage';
import NotFound from './NotFound';

export const routes: RouteObject[] = [
  { path: CLIENT_ROUTES.OAUTH_CALLBACK, element: <OAuthCallback /> },
  {
    element: <GuestRoute />,
    children: [
      { path: CLIENT_ROUTES.LOGIN, element: <Login /> },
      { path: CLIENT_ROUTES.REGISTER, element: <Register /> },
      { path: CLIENT_ROUTES.VERIFY_EMAIL, element: <VerifyEmail /> },
      { path: CLIENT_ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
      { path: CLIENT_ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
    ],
  },
  {
    element: <AppInitGate />,
    children: [
      {
        element: <MobileAppShell />,
        children: [
          {
            element: <PageWrapper />,
            children: [
              { path: CLIENT_ROUTES.FEED, element: <Feed /> },
              { path: CLIENT_ROUTES.VIDEO_WATCH, element: <VideoWatch /> },
              { path: CLIENT_ROUTES.SEARCH, element: <SearchResultsPage /> },
              { path: CLIENT_ROUTES.POSTS, element: <PostsFeedPage /> },
              { path: CLIENT_ROUTES.POST_WATCH, element: <PostWatch /> },
              { path: CLIENT_ROUTES.SHORTS, element: <ShortsEntry /> },
              { path: CLIENT_ROUTES.SHORT_WATCH, element: <ShortWatch /> },
              { path: CLIENT_ROUTES.SHORTS_FEED, element: <ShortsFeedPage /> },
              { path: CLIENT_ROUTES.PROFILE, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_VIDEOS, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_SHORTS, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_POSTS, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_STATS, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_HISTORY, element: <ProfilePage /> },
              {
                path: CLIENT_ROUTES.PROFILE_PLAYLISTS,
                element: <ProfilePage />,
              },
              { path: CLIENT_ROUTES.PROFILE_SAVED, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PLAYLIST, element: <PlaylistPage /> },
              {
                path: CLIENT_ROUTES.PROFILE_FOLLOWERS,
                element: <FollowListPage />,
              },
              {
                path: CLIENT_ROUTES.PROFILE_FOLLOWING,
                element: <FollowListPage />,
              },
              {
                element: <RequireAuth />,
                children: [
                  { path: CLIENT_ROUTES.FOLLOW_REQUESTS, element: <FollowRequestsPage /> },
                  { path: CLIENT_ROUTES.UPLOAD, element: <UploadHub /> },
                  {
                    path: CLIENT_ROUTES.UPLOAD_VIDEO,
                    element: <VideoUploadWizard />,
                  },
                  {
                    path: CLIENT_ROUTES.UPLOAD_VIDEO_FINALIZE,
                    element: <VideoUploadWizard />,
                  },
                  {
                    path: CLIENT_ROUTES.UPLOAD_SHORT,
                    element: <ShortUploadWizard />,
                  },
                  {
                    path: CLIENT_ROUTES.UPLOAD_SHORT_FINALIZE,
                    element: <ShortUploadWizard />,
                  },
                  {
                    path: CLIENT_ROUTES.UPLOAD_POST,
                    element: <PostComposer />,
                  },
                  {
                    path: CLIENT_ROUTES.UPLOAD_POST_FINALIZE,
                    element: <PostComposer />,
                  },
                  { path: CLIENT_ROUTES.SETTINGS, element: <SettingsPage /> },
                  {
                    path: CLIENT_ROUTES.SETTINGS_MY_INFO,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_MY_INFO_BASIC,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_MY_INFO_PERSONAL,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_MY_INFO_CONTACT,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_PREFERENCES,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_PRIVACY,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.SETTINGS_ACCOUNT,
                    element: <SettingsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.MESSAGES,
                    element: <MessagesPage />,
                  },
                  {
                    path: CLIENT_ROUTES.MESSAGES_CONVERSATION,
                    element: <MessagesPage />,
                  },
                  {
                    path: CLIENT_ROUTES.NOTIFICATIONS,
                    element: <NotificationsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.JURY_QUEUE,
                    element: <JuryQueuePage />,
                  },
                  {
                    path: CLIENT_ROUTES.JURY_APPEALS,
                    element: <AppealsPage />,
                  },
                  {
                    path: CLIENT_ROUTES.JURY_CASE,
                    element: <JuryCaseDetailPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];
