import React from "react"
import { Link } from "react-router-dom"
import { Pill, ArrowRight, ShieldCheck, Plus } from "lucide-react"
import { MedicineSearchResult } from "../../types"

interface MedicineCardProps {
  medicine: MedicineSearchResult
  onAddToList?: (med: MedicineSearchResult) => void
  onCheckSafety?: (med: MedicineSearchResult) => void
  className?: string
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onAddToList,
  onCheckSafety,
  className = "",
}) => {
  return (
    <div
      className={`group relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                {medicine.brand_name || medicine.generic_name}
              </h3>
              {medicine.brand_name && (
                <p className="text-xs text-slate-500 italic">Generic: {medicine.generic_name}</p>
              )}
            </div>
          </div>

          {medicine.dosage_form && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              {medicine.dosage_form}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2 text-xs">
          {medicine.active_ingredients && medicine.active_ingredients.length > 0 && (
            <div>
              <span className="text-slate-400 font-medium">Active Ingredients: </span>
              <span className="text-slate-700 font-medium">
                {medicine.active_ingredients.join(", ")}
              </span>
            </div>
          )}

          {medicine.drug_class && (
            <div>
              <span className="text-slate-400 font-medium">Drug Class: </span>
              <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {medicine.drug_class}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/medicines/${medicine.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 group-hover:translate-x-0.5 transition"
        >
          View Verified Info
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-1.5">
          {onCheckSafety && (
            <button
              onClick={() => onCheckSafety(medicine)}
              title="Screen with your current medications"
              className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-800 text-xs font-medium inline-flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Safety Check
            </button>
          )}

          {onAddToList && (
            <button
              onClick={() => onAddToList(medicine)}
              title="Save to personal medication list"
              className="p-1.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-600 hover:text-teal-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicineCard
