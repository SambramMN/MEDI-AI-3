import React, { createContext, useContext, useState } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (title: string, description?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (title, desc) => addToast(title, desc, "success"),
        error: (title, desc) => addToast(title, desc, "error"),
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-teal-900/95 text-white border-teal-800"
                : t.type === "error"
                ? "bg-rose-900/95 text-white border-rose-800"
                : "bg-slate-900/95 text-white border-slate-800"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
            {t.type === "info" && <Info className="w-5 h-5 text-sky-300 shrink-0" />}

            <div className="flex-1">
              <h5 className="text-xs font-semibold">{t.title}</h5>
              {t.description && <p className="text-[11px] opacity-80 mt-0.5">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
