import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const variants: Record<
  ToastType,
  { icon: typeof CheckCircle2; iconClass: string }
> = {
  success: { icon: CheckCircle2, iconClass: 'text-(--color-success)' },
  error: { icon: XCircle, iconClass: 'text-(--color-error)' },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-500' },
  info: { icon: Info, iconClass: 'text-(--color-primary)' },
};

const Toast = ({ id, type, message, onClose, duration = 3000 }: ToastProps) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const close = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 200);
  }, [id, onClose]);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [duration, close]);

  const { icon: Icon, iconClass } = variants[type];

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-80 items-start gap-2.5',
        'rounded-xl border border-border bg-surface-raised',
        'px-3.5 py-3 shadow-2xl shadow-black/20',
        'transition-all duration-200 ease-in-out',
        isLeaving ? 'opacity-0 -translate-y-1.5' : 'opacity-100 translate-y-0'
      )}
    >
      <Icon className={cn('h-4.5 w-4.5 shrink-0 mt-px', iconClass)} />
      <p className="flex-1 text-[0.825rem] leading-snug font-medium text-text-primary">
        {message}
      </p>
      <button
        onClick={close}
        aria-label="Close notification"
        className="shrink-0 -mt-0.5 -mr-1 rounded-md p-1 text-text-muted transition-colors hover:bg-border) hover:text-text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default Toast;
