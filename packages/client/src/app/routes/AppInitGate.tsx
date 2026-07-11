import { Outlet, useLocation } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import AppShellSkeleton from '../../shared/ui/skeleton/AppShellSkeleton';
import ExploreSkeleton from '../../shared/ui/skeleton/ExploreSkeleton';
import ProfileSkeleton from '../../features/creator/skeleton/ProfileSkeleton';
import SettingsSkeleton from '../../features/creator/skeleton/SettingsSkeleton';
import FeedSkeleton from '../../shared/ui/skeleton/FeedSkeleton';
import DefaultPageSkeleton from '../../shared/ui/skeleton/DefaultPageSkeleton';

const renderSkeletonForPath = (pathname: string) => {
  if (pathname.startsWith('/explore')) return <ExploreSkeleton />;
  if (pathname.startsWith('/profile/')) return <ProfileSkeleton />;
  if (pathname.startsWith(CLIENT_ROUTES.SETTINGS)) return <SettingsSkeleton />;
  if (pathname.startsWith(CLIENT_ROUTES.FEED) || pathname === '/')
    return <FeedSkeleton />;
  return <DefaultPageSkeleton />;
};

const AppInitGate = () => {
  const location = useLocation();
  const { isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <AppShellSkeleton>
        {renderSkeletonForPath(location.pathname)}
      </AppShellSkeleton>
    );
  }

  return <Outlet />;
};

export default AppInitGate;
