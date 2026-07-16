import { useCallback } from 'react';
import type { Theme } from '@network/shared';
import { usePreference } from '../../features/settings/hooks/usePreference';

const DEFAULT_THEME: Theme = 'dark';

export const useTheme = () => {
  const [appearance, setAppearance] = usePreference('appearance');
  const theme = appearance.theme ?? DEFAULT_THEME;

  const set = useCallback(
    (next: Theme) => setAppearance({ theme: next }),
    [setAppearance]
  );

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => set(theme === 'light' ? 'dark' : 'light'),
    set,
  };
};
