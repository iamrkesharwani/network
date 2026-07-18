import { useAppSelector } from '../../shared/hooks/useAppSelector';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  return { user, accessToken, isAuthenticated, isInitialized };
};
