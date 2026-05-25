import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-950/95 border-emerald-700/50 text-emerald-100',
  error: 'bg-red-950/95 border-red-700/50 text-red-100',
  info: 'bg-theme-card/95 border-theme-border text-theme-text-light',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-theme-accent shrink-0" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm text-sm font-medium ${variantStyles[toast.variant]}`}
          >
            {variantIcons[toast.variant]}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
