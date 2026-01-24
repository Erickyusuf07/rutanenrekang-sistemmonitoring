"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-[rgb(var(--color-success-50))]/90 text-[rgb(var(--color-success-700))] border-[rgb(var(--color-success-200))]",
    error: "bg-[rgb(var(--color-danger-50))]/90 text-[rgb(var(--color-danger-700))] border-[rgb(var(--color-danger-200))]",
    warning: "bg-[rgb(var(--color-warning-50))]/90 text-[rgb(var(--color-warning-700))] border-[rgb(var(--color-warning-200))]",
    info: "bg-[rgb(var(--color-info-50))]/90 text-[rgb(var(--color-info-700))] border-[rgb(var(--color-info-200))]",
  };

  return (
    <div
      className={`
        ${styles[type]}
        border backdrop-blur-md
        px-4 py-3 rounded-lg shadow-lg
        flex items-center gap-3
        min-w-[300px] max-w-md
        animate-slide-in
      `}
    >
      {icons[type]}
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}