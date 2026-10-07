import React from "react"
import { AlertCircle, AlertTriangle, ExternalLink, ShieldAlert } from "lucide-react"
import { InteractionAlert } from "../../types"
import SeverityBadge from "./SeverityBadge"

interface InteractionCardProps {
  interaction: InteractionAlert
  className?: string
}

export const InteractionCard: React.FC<InteractionCardProps> = ({
  interaction,
  className = "",
}) => {
  const isHigh =
    interaction.severity.toLowerCase() === "high" ||
    interaction.severity.toLowerCase() === "contraindicated"

  return (
    <div
      className={`rounded-2xl border p-5 transition shadow-sm ${
        isHigh
          ? "border-rose-200 bg-rose-50/30"
          : "border-amber-200 bg-amber-50/30"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200/70">
        <div className="flex items-center gap-2">
          {isHigh ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="text-sm font-semibold text-slate-900">
            <span className="text-teal-950 font-bold">{interaction.medicine_a}</span>
            <span className="mx-2 text-slate-400 font-normal">interacts with</span>
            <span className="text-teal-950 font-bold">{interaction.medicine_b}</span>
          </div>
        </div>

        <SeverityBadge severity={interaction.severity} />
      </div>

      <div className="mt-3.5 space-y-3">
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Clinical Interaction Description
          </h5>
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">
            {interaction.description}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80">
          <h5 className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-teal-700" />
            Recommended Clinical Action
          </h5>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
            {interaction.recommendation}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 italic">
            "These medicines may interact. Discuss this combination with a qualified doctor or pharmacist before making any changes."
          </p>
        </div>

        {interaction.source && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Verified Source: <strong className="text-slate-700">{interaction.source}</strong></span>
            {interaction.source_url && (
              <a
                href={interaction.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-teal-700 hover:underline"
              >
                Clinical Reference
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractionCard
