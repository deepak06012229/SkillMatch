import React from "react";
import { useApp } from "../../context/AppContext";

export default function NotificationToast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-slideUp ${
            toast.type === "success"
              ? "bg-primary text-on-primary border-primary-container"
              : toast.type === "info"
              ? "bg-surface-container-highest text-on-surface border-surface-container-high"
              : "bg-error text-on-error border-error-container"
          }`}
        >
          <div className="flex items-center gap-2 text-body-sm font-medium">
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === "success" ? "check_circle" : toast.type === "info" ? "info" : "warning"}
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 p-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
