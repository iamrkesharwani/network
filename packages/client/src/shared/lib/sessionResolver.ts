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

let inFlightResolution: Promise<void> | null = null;

const resolveSessionOnce = (store: AppStore): Promise<void> => {
  if (inFlightResolution) {
    return inFlightResolution;
  }

  inFlightResolution = (async () => {
    await fetchCsrfToken();
    try {
      const { data } = await axiosInstance.post<{
        data: { accessToken: string; user: IUser };
      }>('/auth/refresh');

      const { accessToken, user } = data.data;

      setAccessToken(accessToken);
      store.dispatch(setCredentials({ user, accessToken }));
    } catch {
      setAccessToken(null);
      store.dispatch(clearCredentials());
    } finally {
      store.dispatch(setInitialized());
    }
  })();

  return inFlightResolution;
};

const SessionResolver = ({ store }: SessionResolverProps) => {
  useEffect(() => {
    resolveSessionOnce(store);
  }, [store]);

  return null;
};

export default SessionResolver;
