import { THEME_STORAGE_KEY, type Theme } from '@network/shared';
import { useAppSelector } from './useAppSelector';
import { useDeviceSyncedPreference } from '../../features/user/hooks/useDeviceSyncedPreference';

export const useTheme = () => {
  const dbValue = useAppSelector((state) => state.auth.user?.preferences?.theme);
  const [theme, setTheme] = useDeviceSyncedPreference<Theme>({
    storageKey: THEME_STORAGE_KEY,
    defaultValue: 'dark',
    dbValue,
    toPatch: (value) => ({ theme: value }),
  });

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    set: setTheme,
  };
};
