import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { toggleTheme, setTheme } from '../../features/ui/uiSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => dispatch(toggleTheme()),
    set: (t: 'light' | 'dark') => dispatch(setTheme(t)),
  };
};
