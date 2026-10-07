import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Pill, Plus, Search, Trash2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"
import { medicationApi } from "../api/medicationApi"
import { medicineApi } from "../api/medicineApi"
import { Medication, MedicineSearchResult } from "../types"
import MedicineTable from "../components/common/MedicineTable"
import Modal from "../components/common/Modal"
import SearchBar from "../components/common/SearchBar"
import LoadingState from "../components/common/LoadingState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const MedicationListPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)

  // Add medication form state
  const [enteredName, setEnteredName] = useState("")
  const [formulation, setFormulation] = useState("Tablet")
  const [userNotes, setUserNotes] = useState("")
  const [matchedMedicine, setMatchedMedicine] = useState<MedicineSearchResult | null>(null)
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadMedications = async () => {
    try {
      setIsLoading(true)
      const data = await medicationApi.list()
      setMedications(data)
    } catch (err: any) {
      error("Error loading medications", err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedications()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await medicationApi.remove(id)
      setMedications((prev) => prev.filter((m) => m.id !== id))
      success("Medication Removed", "Successfully updated your record.")
    } catch (err: any) {
      error("Unable to remove", err.message)
    }
  }

  const handleSearchMedicine = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }
    try {
      setIsSearching(true)
      const res = await medicineApi.search(query.trim(), 1, 5)
      setSearchResults(res.results || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectMedicine = (med: MedicineSearchResult) => {
    setMatchedMedicine(med)
    setEnteredName(med.brand_name || med.generic_name)
    if (med.dosage_form) setFormulation(med.dosage_form)
    setSearchResults([])
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enteredName.trim()) {
      error("Name Required", "Please provide a medication name.")
      return
    }

    try {
      setIsSaving(true)
      await medicationApi.add({
        medicine_id: matchedMedicine?.id || null,
        entered_name: enteredName.trim(),
        formulation: formulation.trim(),
        user_notes: userNotes.trim() || undefined,
      })
      success("Medication Added", `${enteredName} has been added to your profile.`)
      setIsAddModalOpen(false)
      // Reset form
      setEnteredName("")
      setFormulation("Tablet")
      setUserNotes("")
      setMatchedMedicine(null)
      loadMedications()
    } catch (err: any) {
      error("Failed to Save", err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Personal Medication Record
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your active medicine regimen for instant interaction cross-referencing.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      <MedicalNoticeBanner />

      {/* Main Table view */}
      {isLoading ? (
        <LoadingState rows={4} />
      ) : (
        <MedicineTable
          medications={medications}
          onDelete={handleDelete}
          onCheckSafety={(med) => navigate(`/safety-checker?add=${med.medicine_id || ""}`)}
        />
      )}

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Medication to Record"
        description="Search our verified database or manually enter your formulation."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Search Clinical Database (Optional auto-match)
            </label>
            <SearchBar
              onSearch={handleSearchMedicine}
              isLoading={isSearching}
              placeholder="Search e.g. Metformin, Lisinopril..."
            />

            {searchResults.length > 0 && (
              <div className="mt-2 divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMedicine(item)}
                    className="p-2.5 hover:bg-teal-50/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900">
                        {item.brand_name || item.generic_name}
                      </strong>
                      <span className="text-slate-400 ml-1">({item.generic_name})</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-medium">Select</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medication Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={enteredName}
              onChange={(e) => setEnteredName(e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Formulation / Dosage Form
            </label>
            <select
              value={formulation}
              onChange={(e) => setFormulation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup / Liquid">Syrup / Liquid</option>
              <option value="Injection">Injection</option>
              <option value="Inhaler">Inhaler</option>
              <option value="Topical Cream">Topical Cream</option>
              <option value="Drops">Drops</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Personal Notes (e.g. taken morning with meal)
            </label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Optional personal notes (stored securely, no sensitive diagnostic data required)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold transition flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Medication"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MedicationListPage
