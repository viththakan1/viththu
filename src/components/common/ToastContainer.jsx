import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-500/30 bg-rose-50/90 text-rose-950',
    info: 'border-cyan-500/30 bg-cyan-50/90 text-cyan-950'
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-[100] max-w-sm w-full px-4 sm:px-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
