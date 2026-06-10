import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      role="alert"
      className={`flex items-start w-full max-w-sm p-4 mb-3 border rounded-lg shadow-lg pointer-events-auto transition-all duration-300 ${currentStyle.bg}`}
    >
      <div className="shrink-0">{currentStyle.icon}</div>

      <div className={`ml-3 w-0 flex-1 pt-0.5 ${currentStyle.text}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>

      <div className="flex shrink-0 ml-4">
        <button
          onClick={() => onClose(id)}
          className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 opacity-70 hover:opacity-100 transition-opacity ${currentStyle.text}`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
