"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  type = "danger"
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      icon: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      button: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${style.bg} ${style.border} border-b px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${style.icon}`}>
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white ${style.button} rounded-lg transition-colors shadow-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}