import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();

    const newToast = {
      id,
      message,
      type,
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ================= TOAST UI ================= */

function Toast({ toast }) {
  const { message, type } = toast;

  const styles = {
    success: "border-green-400 text-green-100",
    error: "border-red-400 text-red-100",
    delete: "border-red-500 text-red-100",
    add: "border-orange-400 text-orange-100",
  };

  const icons = {
    success: "✅",
    error: "❌",
    delete: "🗑️",
    add: "➕",
  };

  const progressColor = {
    success: "bg-green-400",
    error: "bg-red-400",
    delete: "bg-red-500",
    add: "bg-orange-400",
  };

  return (
    <div
      className={`
        relative w-[320px] overflow-hidden
        backdrop-blur-xl bg-white/10
        border rounded-2xl shadow-2xl
        px-4 py-3
        animate-slideIn
        ${styles[type]}
      `}
    >
      {/* CONTENT */}
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/10">
        <div className={`h-full animate-progress ${progressColor[type]}`}></div>
      </div>
    </div>
  );
}