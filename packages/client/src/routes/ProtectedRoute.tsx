import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../shared/hooks/useAppSelector';
import AppShellSkeleton from '../shared/skeleton/AppShellSkeleton';
import ExploreSkeleton from '../shared/skeleton/ExploreSkeleton';
import ProfileSkeleton from '../shared/skeleton/ProfileSkeleton';
import SettingsSkeleton from '../shared/skeleton/SettingsSkeleton';
import VideoFeedSkeleton from '../shared/skeleton/video/VideoFeedSkeleton';
import DefaultPageSkeleton from '../shared/skeleton/DefaultPageSkeleton';

const getSkeletonForPath = (pathname: string) => {
  if (pathname.startsWith('/explore')) return ExploreSkeleton;
  if (pathname.startsWith('/profile')) return ProfileSkeleton;
  if (pathname.startsWith('/settings')) return SettingsSkeleton;
  if (pathname.startsWith('/feed') || pathname === '/')
    return VideoFeedSkeleton;
  return DefaultPageSkeleton;
};

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    const PageSkeleton = getSkeletonForPath(location.pathname);
    return (
      <AppShellSkeleton>
        <PageSkeleton />
      </AppShellSkeleton>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={'/login'} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
