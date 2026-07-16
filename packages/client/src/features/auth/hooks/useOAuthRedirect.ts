import { DEFAULT_API_URL } from '@network/shared';

export const useOAuthRedirect = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || DEFAULT_API_URL}/auth/google`;
  };

  return { handleGoogleLogin };
};
