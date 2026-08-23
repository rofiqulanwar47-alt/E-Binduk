import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${
          isSuccess
            ? 'bg-emerald-900/95 text-white border-emerald-500 shadow-emerald-950/20'
            : isError
            ? 'bg-rose-900/95 text-white border-rose-500 shadow-rose-950/20'
            : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-300" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-300" />}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && <div className="text-xs font-bold">{toast.title}</div>}
          <div className="text-xs text-slate-100 leading-snug">{toast.message}</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
