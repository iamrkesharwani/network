import { useEffect } from 'react';
import { PREFERENCES_STORAGE_KEY } from '@network/shared';
import { useAppDispatch } from '../../shared/hooks/useAppDispatch';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { hydratePreferences } from './preferencesSlice';
import { useLazyGetPreferencesQuery } from './preferencesApi';
import { readStoredPreferences } from './lib/preferencesStorage';

const PreferencesSync = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const localVersion = useAppSelector((state) => state.preferences.version);
  const [fetchPreferences] = useLazyGetPreferencesQuery();

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    fetchPreferences()
      .unwrap()
      .then((response) => {
        if (response.data.version <= localVersion) return;

        dispatch(
          hydratePreferences({
            version: response.data.version,
            updatedAt: response.data.updatedAt
              ? new Date(response.data.updatedAt).toISOString()
              : null,
            appearance: response.data.appearance,
            layout: response.data.layout,
            playback: response.data.playback,
            notifications: response.data.notifications,
          })
        );
      })
      .catch(() => {});
  }, [isInitialized, isAuthenticated, dispatch, fetchPreferences, localVersion]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PREFERENCES_STORAGE_KEY || !event.newValue) return;
      const stored = readStoredPreferences();
      if (stored) dispatch(hydratePreferences(stored));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);

  return null;
};

export default PreferencesSync;
