import React from "react"
import { LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: string | number
  subText?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  onClick?: () => void
  className?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subText,
  icon: Icon,
  iconColor = "text-teal-600 bg-teal-50 border-teal-100",
  trend,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-teal-300" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subText && <p className="mt-1 text-xs text-slate-500">{subText}</p>}
    </div>
  )
}

export default DashboardCard
