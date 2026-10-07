import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  HelpCircle,
  Pill,
} from "lucide-react"
import { medicineApi } from "../api/medicineApi"
import { medicationApi } from "../api/medicationApi"
import { interactionApi } from "../api/interactionApi"
import { Medication, MedicineSearchResult, SafetyCheckResponse } from "../types"
import SearchBar from "../components/common/SearchBar"
import SeverityBadge from "../components/common/SeverityBadge"
import InteractionCard from "../components/common/InteractionCard"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const SafetyCheckerPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { error } = useToast()

  const preselectedNewId = searchParams.get("add")

  const [savedMedications, setSavedMedications] = useState<Medication[]>([])
  const [selectedExistingIds, setSelectedExistingIds] = useState<string[]>([])
  const [newMedicine, setNewMedicine] = useState<MedicineSearchResult | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<SafetyCheckResponse | null>(null)

  // Fetch saved user medications
  useEffect(() => {
    const loadUserMeds = async () => {
      try {
        const meds = await medicationApi.list()
        setSavedMedications(meds)
        // Select all existing by default if available
        setSelectedExistingIds(meds.map((m) => m.id))
      } catch (err) {
        console.error("Could not fetch user medications:", err)
      }
    }
    loadUserMeds()
  }, [])

  // If a medicine was pre-selected from search/detail page
  useEffect(() => {
    if (preselectedNewId) {
      medicineApi.getById(preselectedNewId).then((data) => {
        setNewMedicine(data)
      }).catch(console.error)
    }
  }, [preselectedNewId])

  const handleSearchMedicine = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }
    try {
      setIsSearching(true)
      const res = await medicineApi.search(query.trim(), 1, 6)
      setSearchResults(res.results || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const toggleSelectExisting = (id: string) => {
    setSelectedExistingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleRunCheck = async () => {
    if (!newMedicine) {
      error("Candidate Medicine Required", "Please select a candidate medicine to evaluate.")
      return
    }

    try {
      setIsChecking(true)
      setCheckResult(null)
      const res = await interactionApi.checkSafety({
        existing_medication_ids: selectedExistingIds,
        new_medication_id: newMedicine.id,
      })
      setCheckResult(res)
    } catch (err: any) {
      error("Safety Check Error", err.message || "Interaction information is unavailable.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Medication Safety Checker
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Screen combinations for drug-drug interactions and duplicate active ingredients prior to administration.
        </p>
      </div>

      <MedicalNoticeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Combination Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Candidate New Medicine */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                Medicine Being Evaluated
              </span>
              {newMedicine && (
                <button
                  onClick={() => setNewMedicine(null)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition"
                >
                  Change
                </button>
              )}
            </h3>

            {newMedicine ? (
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {newMedicine.brand_name || newMedicine.generic_name}
                  </h4>
                  <p className="text-xs text-slate-500 italic">
                    Generic: {newMedicine.generic_name}
                  </p>
                  {newMedicine.active_ingredients && (
                    <p className="text-[11px] text-teal-800 mt-1">
                      Active: {newMedicine.active_ingredients.join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Selected
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearchMedicine}
                  isLoading={isSearching}
                  placeholder="Search medicine to add (e.g. Ibuprofen, Warfarin)..."
                />

                {searchResults.length > 0 && (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-52 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setNewMedicine(item)
                          setSearchResults([])
                          setSearchQuery("")
                        }}
                        className="p-3 hover:bg-teal-50/60 cursor-pointer transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900">
                            {item.brand_name || item.generic_name}
                          </strong>
                          <span className="text-slate-400 ml-1.5 font-normal">
                            ({item.generic_name})
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-teal-700" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Existing Medications */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-800 text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Existing Medications to Screen Against
            </h3>

            {savedMedications.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                No saved medications in your record.
                <button
                  onClick={() => navigate("/medicines")}
                  className="block mx-auto mt-2 text-teal-700 font-semibold hover:underline"
                >
                  Add medications first
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {savedMedications.map((med) => {
                  const isSelected = selectedExistingIds.includes(med.id)
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleSelectExisting(med.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? "border-teal-300 bg-teal-50/40"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-teal-700 focus:ring-teal-600 h-4 w-4"
                        />
                        <div>
                          <strong className="text-slate-900">{med.entered_name}</strong>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {med.medicine?.generic_name || "Custom formulation"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {med.formulation || "Tablet"}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              onClick={handleRunCheck}
              disabled={isChecking || !newMedicine}
              className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Clinical Cross-Check...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Check Medication Safety
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Clinical Results Output (7 cols) */}
        <div className="lg:col-span-7">
          {checkResult ? (
            <div className="space-y-5">
              {/* Overall Status Banner */}
              <div
                className={`p-5 rounded-2xl border shadow-sm ${
                  checkResult.status === "no_known_issue"
                    ? "border-teal-200 bg-teal-50/50"
                    : checkResult.status === "potential_interaction" ||
                      checkResult.overall_severity === "high"
                    ? "border-rose-200 bg-rose-50/40"
                    : "border-amber-200 bg-amber-50/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200/60">
                  <div className="flex items-center gap-2">
                    {checkResult.status === "no_known_issue" ? (
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {checkResult.status === "no_known_issue"
                          ? "No Known Interaction Identified"
                          : checkResult.status === "duplicate_ingredient"
                          ? "Duplicate Active Ingredient Detected"
                          : "Potential Clinical Interaction Detected"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Check Reference ID: {checkResult.check_id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <SeverityBadge severity={checkResult.overall_severity || checkResult.status} />
                </div>

                <p className="mt-3 text-xs text-slate-700 leading-relaxed font-medium">
                  {checkResult.disclaimer}
                </p>
              </div>

              {/* Duplicate Ingredients Alerts */}
              {checkResult.duplicate_ingredients?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Copy className="w-4 h-4 text-amber-600" />
                    Duplicate Active Ingredients Flagged
                  </h4>
                  {checkResult.duplicate_ingredients.map((dup, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 text-xs space-y-1.5"
                    >
                      <div className="font-bold text-slate-900">
                        Molecule: <span className="text-amber-800">{dup.ingredient}</span>
                      </div>
                      <p className="text-slate-600">{dup.description}</p>
                      <p className="text-[11px] text-amber-800 font-semibold italic">
                        "These medicines contain the same active ingredient. Review the combination with a pharmacist or doctor before taking them together."
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactions Breakdown */}
              {checkResult.interactions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Interactions Identified ({checkResult.interactions.length})
                  </h4>
                  {checkResult.interactions.map((int, idx) => (
                    <InteractionCard key={idx} interaction={int} />
                  ))}
                </div>
              )}

              {/* Source References */}
              {checkResult.source_references?.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Verified Literature & Sources:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {checkResult.source_references.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
              <ShieldCheck className="w-12 h-12 text-teal-600/50 mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                Configure your combination to inspect
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select your candidate medicine and existing treatments on the left, then click Check Medication Safety.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SafetyCheckerPage
