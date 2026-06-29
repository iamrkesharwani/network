import { type RouteObject, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PageWrapper from '../layout/PageWrapper';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import VerifyEmail from '../features/auth/pages/VerifyEmail';
import GuestRoute from './GuestRoute';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import OAuthCallback from '../features/auth/pages/OAuthCallback';
import FeedPage from '../features/feed/FeedPage';
import {
  Explore,
  Profile,
  Settings,
  NotFound,
} from './__dev__/PlaceholderPages';

export const routes: RouteObject[] = [
  { path: '/oauth/callback', element: <OAuthCallback /> },
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PageWrapper />,
        children: [
          { path: '/', element: <Navigate to="/feed" replace /> },
          { path: '/feed', element: <FeedPage /> },
          { path: '/explore', element: <Explore /> },
          { path: '/profile', element: <Profile /> },
          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];
