import React from "react"
import { Copy, AlertTriangle, Check, ExternalLink, Calendar, Stethoscope } from "lucide-react"
import SeverityBadge from "./SeverityBadge"

export interface SafetyAlertItem {
  id: string
  alertType: "interaction" | "duplicate_ingredient" | "precaution"
  severity: "high" | "moderate" | "low" | "contraindicated" | string
  medicines: string[]
  title: string
  description: string
  recommendation: string
  source?: string
  sourceUrl?: string
  dateDetected?: string
  isReviewed?: boolean
}

interface SafetyAlertCardProps {
  alert: SafetyAlertItem
  onToggleReviewed?: (id: string) => void
  className?: string
}

export const SafetyAlertCard: React.FC<SafetyAlertCardProps> = ({
  alert,
  onToggleReviewed,
  className = "",
}) => {
  const isDuplicate = alert.alertType === "duplicate_ingredient"
  const isHigh = alert.severity === "high" || alert.severity === "contraindicated"

  return (
    <div
      className={`p-5 rounded-2xl border transition shadow-sm ${
        alert.isReviewed
          ? "bg-slate-50/70 border-slate-200 opacity-75"
          : isHigh
          ? "bg-rose-50/20 border-rose-200"
          : isDuplicate
          ? "bg-amber-50/25 border-amber-200"
          : "bg-white border-slate-200/90"
      } ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isHigh
                ? "bg-rose-100 text-rose-700"
                : isDuplicate
                ? "bg-amber-100 text-amber-800"
                : "bg-teal-100 text-teal-800"
            }`}
          >
            {isDuplicate ? (
              <Copy className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
              <SeverityBadge severity={alert.severity} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Involved: {alert.medicines.join(" + ")}
              </span>
              {alert.dateDetected && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {alert.dateDetected}
                </span>
              )}
            </div>
          </div>
        </div>

        {onToggleReviewed && (
          <button
            onClick={() => onToggleReviewed(alert.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition inline-flex items-center gap-1.5 ${
              alert.isReviewed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            {alert.isReviewed ? "Reviewed" : "Mark as Reviewed"}
          </button>
        )}
      </div>

      <div className="mt-3.5 pl-11 space-y-2.5">
        <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-900 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
            Clinical Guidance
          </span>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            {alert.recommendation}
          </p>
        </div>

        {alert.source && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Reference: {alert.source}</span>
            {alert.sourceUrl && (
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:underline inline-flex items-center gap-0.5"
              >
                Official Documentation <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SafetyAlertCard
