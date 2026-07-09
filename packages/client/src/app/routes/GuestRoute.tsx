import { Navigate, Outlet } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import AuthSkeleton from '../../features/auth/skeleton/AuthSkeleton';
import { useAppSelector } from '../../shared/hooks/useAppSelector';

const GuestRoute = () => {
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to={CLIENT_ROUTES.FEED} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
