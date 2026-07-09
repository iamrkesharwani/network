import { useEffect } from 'react';
import type { AppStore } from '../../app/store/store';
import { fetchCsrfToken, setAccessToken, axiosInstance } from './axiosInstance';
import {
  setCredentials,
  clearCredentials,
  setInitialized,
} from '../../features/auth/authSlice';
import type { IUser } from '@network/shared';

interface SessionResolverProps {
  store: AppStore;
}

const SessionResolver = ({ store }: SessionResolverProps) => {
  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      await fetchCsrfToken();
      try {
        const { data } = await axiosInstance.post<{
          data: { accessToken: string; user: IUser };
        }>('/auth/refresh');

        if (!isMounted) return;

        const { accessToken, user } = data.data;

        setAccessToken(accessToken);
        store.dispatch(setCredentials({ user, accessToken }));
      } catch {
        if (!isMounted) return;

        setAccessToken(null);
        store.dispatch(clearCredentials());
      } finally {
        if (isMounted) {
          store.dispatch(setInitialized());
        }
      }
    };

    resolveSession();

    return () => {
      isMounted = false;
    };
  }, [store]);

  return null;
};

export default SessionResolver;
