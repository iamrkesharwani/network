import { Navigate, Outlet } from 'react-router-dom';
import AuthSkeleton from '../shared/skeleton/auth/AuthSkeleton';
import { useAppSelector } from '../shared/hooks/useAppSelector';

const GuestRoute = () => {
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
