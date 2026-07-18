import { useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useIsMounted } from '../../hooks/useIsMounted';
import { ToastContext, type ToastAction } from '../../hooks/useToast';
import type { ToastType } from '@network/shared';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const isMounted = useIsMounted();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration = 3000,
      action?: ToastAction
    ) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration, action }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {isMounted &&
        createPortal(
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col items-center gap-2 w-full max-w-80 px-4 pointer-events-none"
            aria-live="assertive"
            aria-atomic="false"
          >
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                action={toast.action}
                onClose={removeToast}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
