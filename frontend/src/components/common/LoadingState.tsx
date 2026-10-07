import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  subMessage?: string
  className?: string
  rows?: number
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data from clinical database...",
  subMessage = "Verifying safety records with medical reference sources",
  className = "",
  rows,
}) => {
  if (rows) {
    return (
      <div className={`space-y-3 p-4 animate-pulse ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl w-full border border-slate-200/60" />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="relative flex items-center justify-center w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-teal-100 animate-ping opacity-25" />
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-800">{message}</p>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  )
}

export default LoadingState
