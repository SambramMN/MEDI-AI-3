import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  Loader2,
  FileText,
  ArrowRight,
} from "lucide-react"
import { scannerApi } from "../api/scannerApi"
import { medicationApi } from "../api/medicationApi"
import { DetectedMedicineCandidate, ScannerResponse } from "../types"
import FileUploader from "../components/common/FileUploader"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanResponse, setScanResponse] = useState<ScannerResponse | null>(null)
  const [confirmedMedicines, setConfirmedMedicines] = useState<
    { name: string; isConfirmed: boolean; id?: string | null }[]
  >([])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleProcessScan = async () => {
    if (!selectedFile) {
      error("File Required", "Please select an image or PDF to process.")
      return
    }

    try {
      setIsScanning(true)
      const res = await scannerApi.uploadScan(selectedFile)
      setScanResponse(res)

      // Initialize candidate list for user confirmation/editing
      const initialCandidates = res.detected_medicines.map((m) => ({
        name: m.matched_medicine_name || m.detected_text,
        isConfirmed: false,
        id: m.matched_medicine_id,
      }))
      setConfirmedMedicines(initialCandidates)
      success("OCR Extraction Finished", `Detected ${initialCandidates.length} candidate medicines.`)
    } catch (err: any) {
      error("OCR Scan Failed", err.message || "OCR could not confidently identify the medicine.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleEditName = (index: number, newName: string) => {
    setConfirmedMedicines((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    )
  }

  const handleToggleConfirm = (index: number) => {
    setConfirmedMedicines((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isConfirmed: !item.isConfirmed } : item))
    )
  }

  const handleRemoveCandidate = (index: number) => {
    setConfirmedMedicines((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddConfirmedToMedications = async (name: string, medicineId?: string | null) => {
    try {
      await medicationApi.add({
        medicine_id: medicineId || null,
        entered_name: name,
        formulation: "Identified via OCR Package Scan",
      })
      success("Saved", `${name} added to your medication list.`)
    } catch (err: any) {
      error("Save Error", err.message)
    }
  }

  const handleRunSafetyWithCandidates = () => {
    const verified = confirmedMedicines.filter((c) => c.isConfirmed)
    if (verified.length === 0) {
      error("Confirmation Required", "Please confirm at least one medicine name before screening.")
      return
    }
    const target = verified[0]
    navigate(`/safety-checker?add=${target.id || ""}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Medicine Scanner & Prescription OCR
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload medicine packaging or prescriptions to extract medicine candidate names.
        </p>
      </div>

      <MedicalNoticeBanner />

      {/* Uncertainty Notice banner as strictly requested by spec */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Important Clinical Verification Rule:</span>
          <p className="mt-0.5 leading-relaxed">
            "OCR results must be treated as uncertain until confirmed by the user. Please review and verify each detected medicine name before performing any safety analysis."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scan className="w-4 h-4 text-teal-700" />
              Upload Medicine Package / Prescription
            </h3>

            <FileUploader onFileSelect={handleFileSelect} isUploading={isScanning} />

            <button
              onClick={handleProcessScan}
              disabled={!selectedFile || isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting Text via OCR Engine...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Process & Extract Medicine Names
                </>
              )}
            </button>
          </div>

          {scanResponse && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Raw Extracted OCR Text:
              </span>
              <p className="p-2.5 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-100">
                {scanResponse.extracted_text || "No legible text found in document"}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Confidence: {(scanResponse.overall_confidence * 100).toFixed(0)}%</span>
                <span>Result ID: {scanResponse.result_id.slice(0, 8)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Detected Medicines List (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 min-h-[400px]">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detected Medicines & Candidates
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm or edit detected names before performing safety analysis.
                </p>
              </div>

              {confirmedMedicines.some((c) => c.isConfirmed) && (
                <button
                  onClick={handleRunSafetyWithCandidates}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  Screen Confirmed
                </button>
              )}
            </div>

            {confirmedMedicines.length > 0 ? (
              <div className="space-y-3">
                {confirmedMedicines.map((candidate, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      candidate.isConfirmed
                        ? "border-teal-300 bg-teal-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={candidate.name}
                          onChange={(e) => handleEditName(idx, e.target.value)}
                          className="font-bold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none bg-transparent"
                        />
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Status: {candidate.isConfirmed ? "Confirmed by User" : "Unconfirmed (Pending Review)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleConfirm(idx)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                          candidate.isConfirmed
                            ? "bg-teal-800 text-white border-teal-800"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {candidate.isConfirmed ? "Confirmed" : "Confirm"}
                      </button>

                      <button
                        onClick={() => handleAddConfirmedToMedications(candidate.name, candidate.id)}
                        title="Add to personal medication list"
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-500 hover:text-teal-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveCandidate(idx)}
                        title="Remove candidate"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Scan className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No scanned items yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload an image of a medicine packet, blister packaging, or prescription slip on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScannerPage
