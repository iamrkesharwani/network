import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from '../../shared/hooks/useAppSelector';

const RequireAuth = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <Navigate to={CLIENT_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
