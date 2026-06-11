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
    if (!duration) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const variants: Record<
    ToastType,
    { container: string; icon: React.ReactNode }
  > = {
    success: {
      container: 'border-success bg-success/10 text-success',
      icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    },
    error: {
      container: 'border-error bg-error/10 text-error',
      icon: <XCircle className="h-5 w-5 shrink-0" />,
    },
    warning: {
      container: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
      icon: <AlertCircle className="h-5 w-5 shrink-0" />,
    },
    info: {
      container: 'border-primary bg-primary/10 text-primary',
      icon: <Info className="h-5 w-5 shrink-0" />,
    },
  };

  const { container, icon } = variants[type];

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-center gap-3',
        'overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
        container
      )}
    >
      {icon}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        aria-label="Close notification"
        className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
