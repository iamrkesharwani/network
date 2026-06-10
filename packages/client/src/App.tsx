import ToastProvider from './shared/components/ToastContainer';
import { AppRoutes } from './routes/AppRoutes';

const App = () => {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
};

export default App;
