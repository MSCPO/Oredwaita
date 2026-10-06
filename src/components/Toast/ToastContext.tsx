/* eslint-disable react-refresh/only-export-components */
import { createContext, type FC, type ReactNode, useCallback, useContext, useState } from 'react';

import { ToastOverlay, type ToastProps } from './Toast';

export interface ToastOptions {
  title: ReactNode;
  /** Custom action area rendered at the tail of the toast; compose any number of Buttons here. */
  actions?: ReactNode;
  /** Optional leading icon rendered before the title. */
  icon?: ReactNode;
  timeout?: number;
}

export interface ToastContextValue {
  addToast: (toast: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newToast: ToastProps = {
      id,
      ...options,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <ToastOverlay toasts={toasts} onDismissToast={removeToast}>
        {children}
      </ToastOverlay>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return ctx;
};
