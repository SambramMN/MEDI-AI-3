import React from "react"
import { ShieldAlert, AlertTriangle } from "lucide-react"

interface MedicalNoticeBannerProps {
  compact?: boolean
  className?: string
  customText?: string
}

export const MedicalNoticeBanner: React.FC<MedicalNoticeBannerProps> = ({
  compact = false,
  className = "",
  customText,
}) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50/70 border border-teal-100 text-teal-900 text-xs ${className}`}
      >
        <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0" />
        <p className="leading-snug">
          {customText ||
            "Informational support only. MedSafe AI does not diagnose, prescribe, or calculate dosages. Always consult a licensed doctor or pharmacist."}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-white p-4 text-slate-800 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 shadow-sm">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-teal-950 flex items-center gap-2">
            Important Medical Safety Notice
            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Clinical Advisory
            </span>
          </h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {customText ||
              "MedSafe AI provides verified educational information and safety screening support. It does NOT diagnose medical conditions, prescribe drugs, or substitute professional clinical evaluation. Do not start, discontinue, or alter dosages without consulting your physician or qualified pharmacist."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MedicalNoticeBanner
