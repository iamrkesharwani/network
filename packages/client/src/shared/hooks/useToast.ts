import { createContext, useContext } from 'react';
import type { ToastType } from '../ui/overlay/Toast';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastContextType {
  addToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: ToastAction
  ) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
