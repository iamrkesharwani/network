import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../shared/hooks/useAppSelector';
import AppShellSkeleton from '../shared/skeleton/gen/AppShellSkeleton';
import ExploreSkeleton from '../shared/skeleton/gen/ExploreSkeleton';
import ProfileSkeleton from '../shared/skeleton/profile/ProfileSkeleton';
import SettingsSkeleton from '../shared/skeleton/profile/SettingsSkeleton';
import FeedSkeleton from '../shared/skeleton/gen/FeedSkeleton';
import DefaultPageSkeleton from '../shared/skeleton/gen/DefaultPageSkeleton';

const renderSkeletonForPath = (pathname: string) => {
  if (pathname.startsWith('/explore')) return <ExploreSkeleton />;
  if (pathname.startsWith('/profile')) return <ProfileSkeleton />;
  if (pathname.startsWith('/settings')) return <SettingsSkeleton />;
  if (pathname.startsWith('/feed') || pathname === '/') return <FeedSkeleton />;
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
    return <Navigate to={'/login'} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
