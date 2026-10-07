import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, Pill, ShieldAlert, Sparkles, Layers } from "lucide-react"
import { medicineApi } from "../api/medicineApi"
import { medicationApi } from "../api/medicationApi"
import { MedicineSearchResult } from "../types"
import SearchBar from "../components/common/SearchBar"
import MedicineCard from "../components/common/MedicineCard"
import LoadingState from "../components/common/LoadingState"
import EmptyState from "../components/common/EmptyState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const MedicineSearchPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [searchQuery, setSearchQuery] = useState("paracetamol")
  const [results, setResults] = useState<MedicineSearchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedForm, setSelectedForm] = useState<string>("all")

  const handleSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }

    try {
      setIsLoading(true)
      setHasSearched(true)
      const res = await medicineApi.search(query.trim())
      setResults(res.results || [])
    } catch (err: any) {
      console.error("Search error:", err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial search on mount
  useEffect(() => {
    handleSearch("paracetamol")
  }, [])

  const handleAddToList = async (med: MedicineSearchResult) => {
    try {
      await medicationApi.add({
        medicine_id: med.id,
        entered_name: med.brand_name || med.generic_name,
        formulation: med.dosage_form || "Tablet",
      })
      success("Medication Saved", `${med.brand_name || med.generic_name} added to your personal list.`)
    } catch (err: any) {
      error("Unable to Save", err.message || "Failed to add medication.")
    }
  }

  // Extract unique filters from results
  const drugClasses = Array.from(
    new Set(results.map((r) => r.drug_class).filter(Boolean) as string[])
  )
  const dosageForms = Array.from(
    new Set(results.map((r) => r.dosage_form).filter(Boolean) as string[])
  )

  // Filtered results
  const filteredResults = results.filter((item) => {
    const matchClass = selectedClass === "all" || item.drug_class === selectedClass
    const matchForm = selectedForm === "all" || item.dosage_form === selectedForm
    return matchClass && matchForm
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medicine Search & Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search across verified clinical medicines by brand name, generic name, or active ingredients.
          </p>
        </div>
      </div>

      <MedicalNoticeBanner />

      {/* Main Search Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Search by brand name (e.g. Tylenol), generic (e.g. Paracetamol), or active ingredient..."
        />

        {/* Filter bars */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter by:
            </span>

            {/* Drug class filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="all">All Drug Classes</option>
              {drugClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            {/* Dosage form filter */}
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="all">All Dosage Forms</option>
              {dosageForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-medium">
            Showing {filteredResults.length} of {results.length} verified medicines
          </span>
        </div>
      </div>

      {/* Search results display */}
      {isLoading ? (
        <LoadingState
          message="Querying clinical medicine database..."
          subMessage="Fetching verified brand names, active ingredients, and indications"
        />
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onAddToList={handleAddToList}
              onCheckSafety={(item) => navigate(`/safety-checker?add=${item.id}`)}
            />
          ))}
        </div>
      ) : hasSearched ? (
        <EmptyState
          title="No medicine found"
          description="Medicine information is currently unavailable for this specific query. Please verify the exact brand or generic spelling."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedClass("all")
            setSelectedForm("all")
            handleSearch("paracetamol")
          }}
        />
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200">
          <Pill className="w-10 h-10 text-teal-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Start typing to explore clinical medicine records
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Access active ingredient breakdowns, contraindications, and potential interaction profiles.
          </p>
        </div>
      )}
    </div>
  )
}

export default MedicineSearchPage
