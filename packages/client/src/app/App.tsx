import { useEffect, type ReactNode } from 'react';
import ToastProvider from '../shared/ui/overlay/ToastContainer';
import { useAppSelector } from '../shared/hooks/useAppSelector';

const App = ({ children }: { children: ReactNode }) => {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <ToastProvider>{children}</ToastProvider>;
};

export default App;
