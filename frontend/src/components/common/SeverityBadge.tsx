import React from "react"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface SeverityBadgeProps {
  severity?: string | null
  className?: string
  showIcon?: boolean
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity = "info",
  className = "",
  showIcon = true,
}) => {
  const norm = (severity || "").toLowerCase()

  if (norm === "high" || norm === "contraindicated") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
      >
        {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
        {norm === "contraindicated" ? "Contraindicated (High Risk)" : "High Severity"}
      </span>
    )
  }

  if (norm === "moderate" || norm === "warning" || norm === "duplicate_ingredient") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
        {norm === "duplicate_ingredient" ? "Duplicate Ingredient" : "Moderate Risk"}
      </span>
    )
  }

  if (norm === "low") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 ${className}`}
      >
        {showIcon && <Info className="w-3.5 h-3.5 text-sky-600" />}
        Low / Minor
      </span>
    )
  }

  if (norm === "no_known_issue" || norm === "safe") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${className}`}
      >
        {showIcon && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
        No Known Issue Identified
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      {showIcon && <Info className="w-3.5 h-3.5 text-slate-500" />}
      {severity ? severity.toUpperCase() : "Informational"}
    </span>
  )
}

export default SeverityBadge
