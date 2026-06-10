import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../shared/hooks/useAppSelector';
import Spinner from '../shared/components/Spinner';

const ProtectedRoute = () => {
  const location = useLocation();
  const { token, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <Spinner
          size="xl"
          messages={['Verifying access...', 'Securing connection...']}
        />
      </div>
    );
  }

  if (!token) {
    return <Navigate to={'/login'} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
