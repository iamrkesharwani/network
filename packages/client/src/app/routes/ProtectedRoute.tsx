import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import AppShellSkeleton from '../../shared/ui-kit/skeleton/AppShellSkeleton';
import ExploreSkeleton from '../../shared/ui-kit/skeleton/ExploreSkeleton';
import ProfileSkeleton from '../../features/creator/skeleton/ProfileSkeleton';
import SettingsSkeleton from '../../features/creator/skeleton/SettingsSkeleton';
import FeedSkeleton from '../../shared/ui-kit/skeleton/FeedSkeleton';
import DefaultPageSkeleton from '../../shared/ui-kit/skeleton/DefaultPageSkeleton';

const renderSkeletonForPath = (pathname: string) => {
  if (pathname.startsWith('/explore')) return <ExploreSkeleton />;
  if (pathname.startsWith(CLIENT_ROUTES.PROFILE)) return <ProfileSkeleton />;
  if (pathname.startsWith(CLIENT_ROUTES.SETTINGS)) return <SettingsSkeleton />;
  if (pathname.startsWith(CLIENT_ROUTES.FEED) || pathname === '/')
    return <FeedSkeleton />;
  return <DefaultPageSkeleton />;
};

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return (
      <AppShellSkeleton>
        {renderSkeletonForPath(location.pathname)}
      </AppShellSkeleton>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={CLIENT_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
