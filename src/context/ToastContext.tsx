import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastItem, ToastType } from '../types/common';

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  showToast: () => {},
  removeToast: () => {},
});

export const useToast = (): ToastContextType => {
  return useContext(ToastContext);
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, showToast: addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
