import { useEffect, type ReactNode } from 'react';
import ToastProvider from '../shared/ui/overlay/ToastContainer';
import { useTheme } from '../shared/hooks/useTheme';

const App = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <ToastProvider>{children}</ToastProvider>;
};

export default App;
