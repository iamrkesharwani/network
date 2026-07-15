import { type RouteObject } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import AppInitGate from './AppInitGate';
import RequireAuth from './RequireAuth';
import PageWrapper from '../layout/PageWrapper';
import Login from '../../features/auth/pages/Login';
import Register from '../../features/auth/pages/Register';
import VerifyEmail from '../../features/auth/pages/VerifyEmail';
import GuestRoute from './GuestRoute';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import ResetPassword from '../../features/auth/pages/ResetPassword';
import OAuthCallback from '../../features/auth/pages/OAuthCallback';
import Feed from '../../features/feed/Feed';
import VideoWatch from '../../features/video/pages/VideoWatch';
import ShortWatch from '../../features/short/pages/ShortWatch';
import UploadHub from '../../features/upload/components/UploadHub';
import VideoUploadWizard from '../../features/video/form/VideoUploadWizard';
import ShortUploadWizard from '../../features/short/form/ShortUploadWizard';
import PostComposer from '../../features/post/form/PostComposer';
import PostsFeedPage from '../../features/post/pages/PostsFeedPage';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import SettingsPage from '../../features/creator/pages/SettingsPage';
import SearchResultsPage from '../../features/search/pages/SearchResultsPage';
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
      { path: CLIENT_ROUTES.SHORT_WATCH, element: <ShortWatch /> },
      {
        element: <PageWrapper />,
        children: [
          { path: CLIENT_ROUTES.FEED, element: <Feed /> },
          { path: CLIENT_ROUTES.VIDEO_WATCH, element: <VideoWatch /> },
          { path: CLIENT_ROUTES.SEARCH, element: <SearchResultsPage /> },
          { path: CLIENT_ROUTES.POSTS, element: <PostsFeedPage /> },
          { path: CLIENT_ROUTES.POST_WATCH, element: <PostsFeedPage /> },
          { path: CLIENT_ROUTES.PROFILE, element: <ProfilePage /> },
          { path: CLIENT_ROUTES.PROFILE_VIDEOS, element: <ProfilePage /> },
          { path: CLIENT_ROUTES.PROFILE_SHORTS, element: <ProfilePage /> },
          { path: CLIENT_ROUTES.PROFILE_POSTS, element: <ProfilePage /> },
          { path: CLIENT_ROUTES.PROFILE_STATS, element: <ProfilePage /> },
          {
            element: <RequireAuth />,
            children: [
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
              { path: CLIENT_ROUTES.UPLOAD_POST, element: <PostComposer /> },
              {
                path: CLIENT_ROUTES.UPLOAD_POST_FINALIZE,
                element: <PostComposer />,
              },
              { path: CLIENT_ROUTES.SETTINGS, element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];
