import React from "react"
import { SearchX, AlertCircle, FileQuestion, HelpCircle, LucideIcon } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
  className?: string
  variant?: "search" | "error" | "missing" | "info"
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No information found",
  description = "No matching records were located in the clinical database.",
  icon: CustomIcon,
  actionLabel,
  onAction,
  className = "",
  variant = "info",
}) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-8 h-8 text-slate-400" />
    if (variant === "search") return <SearchX className="w-8 h-8 text-slate-400" />
    if (variant === "error") return <AlertCircle className="w-8 h-8 text-amber-500" />
    if (variant === "missing") return <FileQuestion className="w-8 h-8 text-slate-400" />
    return <HelpCircle className="w-8 h-8 text-teal-600" />
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-3 shadow-inner">
        {getIcon()}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
