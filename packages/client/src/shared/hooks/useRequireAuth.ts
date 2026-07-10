import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import { useAppSelector } from './useAppSelector';

export const useRequireAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  return useCallback(() => {
    if (isAuthenticated) return true;
    navigate(CLIENT_ROUTES.LOGIN, { state: { from: location } });
    return false;
  }, [isAuthenticated, navigate, location]);
};
