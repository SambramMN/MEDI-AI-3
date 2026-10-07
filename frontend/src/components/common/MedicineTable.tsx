import React from "react"
import { Link } from "react-router-dom"
import { Trash2, ShieldCheck, Pill, ExternalLink } from "lucide-react"
import { Medication } from "../../types"

interface MedicineTableProps {
  medications: Medication[]
  onDelete?: (id: string) => void
  onCheckSafety?: (med: Medication) => void
  isLoading?: boolean
  className?: string
}

export const MedicineTable: React.FC<MedicineTableProps> = ({
  medications,
  onDelete,
  onCheckSafety,
  isLoading = false,
  className = "",
}) => {
  if (medications.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-slate-200 bg-white">
        <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">No medications added yet</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Search for a medicine or scan a prescription to add to your personal list.
        </p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">Medicine Name</th>
            <th className="py-3 px-4">Active Ingredient</th>
            <th className="py-3 px-4">Formulation / Notes</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Added Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {medications.map((item) => {
            const addedDate = item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent"

            const activeIngs =
              item.medicine?.active_ingredients?.join(", ") || "Active ingredient on record"

            return (
              <tr key={item.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span>{item.entered_name}</span>
                      {item.medicine_id && (
                        <Link
                          to={`/medicines/${item.medicine_id}`}
                          className="ml-1 text-[11px] text-teal-700 hover:underline inline-flex items-center"
                        >
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{activeIngs}</td>
                <td className="py-3.5 px-4 text-slate-500">
                  <span className="font-medium text-slate-700">
                    {item.formulation || "Standard"}
                  </span>
                  {item.user_notes && (
                    <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                      {item.user_notes}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{addedDate}</td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onCheckSafety && (
                      <button
                        onClick={() => onCheckSafety(item)}
                        title="Screen against other medications"
                        className="p-1.5 rounded-lg border border-teal-200 bg-teal-50/80 text-teal-800 hover:bg-teal-100 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Remove from list"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default MedicineTable
