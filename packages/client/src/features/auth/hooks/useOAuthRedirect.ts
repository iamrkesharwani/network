import { API_V1_PREFIX } from '@network/shared';

export const useOAuthRedirect = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || API_V1_PREFIX}/auth/google`;
  };

  return { handleGoogleLogin };
};
