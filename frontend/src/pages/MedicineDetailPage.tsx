import React, { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Pill,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  HeartPulse,
} from "lucide-react"
import { medicineApi } from "../api/medicineApi"
import { medicationApi } from "../api/medicationApi"
import { MedicineDetail } from "../types"
import LoadingState from "../components/common/LoadingState"
import EmptyState from "../components/common/EmptyState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [medicine, setMedicine] = useState<MedicineDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        setFetchError(null)
        const data = await medicineApi.getById(id)
        setMedicine(data)
      } catch (err: any) {
        setFetchError(err.message || "Medicine information is currently unavailable.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  const handleAddToList = async () => {
    if (!medicine) return
    try {
      await medicationApi.add({
        medicine_id: medicine.id,
        entered_name: medicine.brand_name || medicine.generic_name,
        formulation: medicine.dosage_form || "Tablet",
      })
      success("Added to Medications", `${medicine.brand_name || medicine.generic_name} is saved to your list.`)
    } catch (err: any) {
      error("Unable to save", err.message || "Failed to add medication.")
    }
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          message="Retrieving verified clinical medicine monograph..."
          subMessage="Fetching indications, side effects, warnings, and verified active ingredients"
        />
      </div>
    )
  }

  if (fetchError || !medicine) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </button>
        <EmptyState
          title="Medicine information is currently unavailable"
          description={fetchError || "Unable to locate verified record in our reference database."}
          actionLabel="Return to Search"
          onAction={() => navigate("/medicines")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToList}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Pill className="w-3.5 h-3.5" />
            Add to My Medications
          </button>
          <Link
            to={`/safety-checker?add=${medicine.id}`}
            className="px-3.5 py-2 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Screen Interaction Safety
          </Link>
        </div>
      </div>

      {/* Hero Medicine Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-sm">
              <Pill className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  {medicine.brand_name || medicine.generic_name}
                </h1>
                {medicine.dosage_form && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {medicine.dosage_form}
                  </span>
                )}
              </div>

              {medicine.brand_name && (
                <p className="text-sm text-slate-500 mt-0.5">
                  Generic formulation: <strong className="text-slate-800">{medicine.generic_name}</strong>
                </p>
              )}

              {medicine.drug_class && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Drug Class: {medicine.drug_class}
                </div>
              )}
            </div>
          </div>

          {medicine.last_verified && (
            <div className="text-right text-[11px] text-slate-400">
              <span>Verified Record: {new Date(medicine.last_verified).toLocaleDateString()}</span>
              {medicine.source && <span className="block font-medium text-slate-500">Source: {medicine.source}</span>}
            </div>
          )}
        </div>

        {/* Active Ingredients highlight */}
        {medicine.active_ingredients && medicine.active_ingredients.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Active Chemical Ingredients
            </h4>
            <div className="flex flex-wrap gap-2">
              {medicine.active_ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Serious Warnings Callout */}
      {medicine.warnings && (
        <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 text-rose-950 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            Serious Clinical Warnings & Precautions
          </div>
          <p className="text-xs text-rose-900 leading-relaxed font-medium">
            {medicine.warnings}
          </p>
        </div>
      )}

      {/* Clinical Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved Uses */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-700" />
            Approved & Common Uses
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {medicine.uses || "Refer to clinical practitioner or package insert for approved indications."}
          </p>
        </div>

        {/* Mechanism of Action / How it works */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700" />
            How It Works (Mechanism of Action)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {medicine.mechanism || medicine.description || "Information on physiological mechanism is derived from verified medical pharmacopeia."}
          </p>
        </div>

        {/* Common Side Effects */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Common Side Effects
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {medicine.side_effects || "No common side effects registered in this extract. Discuss adverse profiles with your pharmacist."}
          </p>
        </div>

        {/* Contraindications / Precautions */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Contraindications & Precautions
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {medicine.contraindications || "Consult your physician regarding renal, hepatic, or hypersensitivity contraindications."}
          </p>
        </div>
      </div>

      {/* Storage Information */}
      {medicine.storage_information && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Recommended Storage Conditions</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {medicine.storage_information}
            </p>
          </div>
        </div>
      )}

      {/* Critical Medical Notice */}
      <div className="p-5 rounded-2xl bg-teal-900 text-white shadow-sm space-y-2">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-300" />
          Mandatory Clinical Notice
        </h4>
        <p className="text-xs text-teal-100/90 leading-relaxed">
          "Do not start, stop, or change medication based solely on this information. Consult a qualified healthcare professional before taking any action."
        </p>
      </div>
    </div>
  )
}

export default MedicineDetailPage
