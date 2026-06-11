import { useEffect } from 'react';
import ToastProvider from './shared/components/ToastContainer';
import { AppRoutes } from './routes/AppRoutes';
import { useAppSelector } from './shared/hooks/useAppSelector';

const App = () => {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
};

export default App;
