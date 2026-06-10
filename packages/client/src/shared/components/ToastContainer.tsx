import {
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Toast, { type ToastType } from './Toast';

interface ToastMessage {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, message, type, duration },
      ]);
    },
    []
  );

  const toastContainer = (
    <div
      className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 pointer-events-none flex flex-col gap-2"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
