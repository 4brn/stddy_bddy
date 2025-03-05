import { createContext, useState, useContext, ReactNode } from "react";

type ToastType =
  | "alert-success"
  | "alert-error"
  | "alert-warning"
  | "alert-info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type NotyfContextType = {
  toasts: Toast[];
  notyf: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    remove: (id: string) => void;
    clear: () => void;
  };
};

const NotyfContext = createContext<NotyfContextType | null>(null);

export const NotyfProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id != id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const notyf = {
    success: (message: string) => addToast(message, "alert-success"),
    error: (message: string) => addToast(message, "alert-error"),
    warning: (message: string) => addToast(message, "alert-warning"),
    info: (message: string) => addToast(message, "alert-info"),
    remove: (id: string) => removeToast(id),
    clear: () => clearToasts(),
  };

  return (
    <NotyfContext.Provider value={{ toasts, notyf }}>
      {children}
    </NotyfContext.Provider>
  );
};

export const useNotyf = () => useContext(NotyfContext);
