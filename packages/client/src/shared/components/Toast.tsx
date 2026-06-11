import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const Toast = ({ id, type, message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const variants = {
    success: {
      container: 'border-success bg-success/10 text-success',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    error: {
      container: 'border-error bg-error/10 text-error',
      icon: <XCircle className="h-5 w-5" />,
    },
    warning: {
      container: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    info: {
      container: 'border-primary bg-primary/10 text-primary',
      icon: <Info className="h-5 w-5" />,
    },
  };

  const { container, icon } = variants[type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
        container
      )}
      role="alert"
    >
      <div className="flex flex-1 items-center space-x-3">
        {icon}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
