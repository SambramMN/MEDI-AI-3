import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Pill,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Plus,
  Search,
  Scan,
  Bot,
  ArrowRight,
  Activity,
  Calendar,
} from "lucide-react"
import { medicationApi } from "../api/medicationApi"
import { interactionApi } from "../api/interactionApi"
import { Medication, SafetyCheckResponse } from "../types"
import DashboardCard from "../components/common/DashboardCard"
import MedicineTable from "../components/common/MedicineTable"
import SafetyAlertCard, { SafetyAlertItem } from "../components/common/SafetyAlertCard"
import LoadingState from "../components/common/LoadingState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import ContributionSkyline from "../components/ui/contribution-skyline"
import { useAuth } from "../context/AuthContext"

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [medications, setMedications] = useState<Medication[]>([])
  const [historyChecks, setHistoryChecks] = useState<SafetyCheckResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [meds, checks] = await Promise.allSettled([
          medicationApi.list(),
          interactionApi.getHistory(),
        ])

        if (meds.status === "fulfilled") {
          setMedications(meds.value || [])
        }
        if (checks.status === "fulfilled") {
          setHistoryChecks(checks.value || [])
        }
      } catch (err) {
        console.error("Dashboard data load error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleDeleteMedication = async (id: string) => {
    try {
      await medicationApi.remove(id)
      setMedications((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error("Failed to delete medication:", err)
    }
  }

  // Calculate alerts from history checks
  const totalInteractions = historyChecks.reduce(
    (acc, curr) => acc + (curr.interactions?.length || 0),
    0
  )
  const totalDuplicates = historyChecks.reduce(
    (acc, curr) => acc + (curr.duplicate_ingredients?.length || 0),
    0
  )

  // Construct top alert items
  const summaryAlerts: SafetyAlertItem[] = []
  historyChecks.forEach((c) => {
    c.interactions?.forEach((int, i) => {
      summaryAlerts.push({
        id: `int-${c.check_id}-${i}`,
        alertType: "interaction",
        severity: int.severity,
        medicines: [int.medicine_a, int.medicine_b],
        title: `Interaction: ${int.medicine_a} + ${int.medicine_b}`,
        description: int.description,
        recommendation: int.recommendation,
        source: int.source || "Clinical Interaction Database",
        dateDetected: "Logged in check",
      })
    })
    c.duplicate_ingredients?.forEach((dup, i) => {
      summaryAlerts.push({
        id: `dup-${c.check_id}-${i}`,
        alertType: "duplicate_ingredient",
        severity: "warning",
        medicines: dup.found_in,
        title: `Duplicate Ingredient: ${dup.ingredient}`,
        description: dup.description,
        recommendation: "Review duplicate active ingredient with a pharmacist or doctor.",
        source: dup.source || "Active Ingredient DB",
        dateDetected: "Logged in check",
      })
    })
  })

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || "Clinician"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time medication screening, active ingredients, and clinical safety monitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/medicines"
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Medication
          </Link>
          <Link
            to="/safety-checker"
            className="px-3.5 py-2 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Run Safety Check
          </Link>
        </div>
      </div>

      <MedicalNoticeBanner />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Current Medicines"
          value={medications.length}
          subText="Active medications in record"
          icon={Pill}
          iconColor="text-teal-700 bg-teal-50 border-teal-100"
          onClick={() => navigate("/medications")}
        />

        <DashboardCard
          title="Safety Checks"
          value={historyChecks.length}
          subText="Total combinations evaluated"
          icon={ShieldCheck}
          iconColor="text-emerald-700 bg-emerald-50 border-emerald-100"
          onClick={() => navigate("/safety-checker")}
        />

        <DashboardCard
          title="Interaction Alerts"
          value={totalInteractions}
          subText="Potential cross-reactions flagged"
          icon={AlertTriangle}
          iconColor="text-amber-700 bg-amber-50 border-amber-200"
          onClick={() => navigate("/interactions")}
        />

        <DashboardCard
          title="Duplicate Ingredients"
          value={totalDuplicates}
          subText="Shared active molecule warnings"
          icon={Copy}
          iconColor="text-rose-700 bg-rose-50 border-rose-200"
          onClick={() => navigate("/alerts")}
        />
      </div>

      {/* Contribution Skyline — Activity Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Medication Activity & Safety Skyline
              </h3>
              <p className="text-[11px] text-slate-500">
                Interactive isometric 3D skyline tracking medication checks, scans, and queries over the year.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Drag to Orbit (3D) • Click Day for Log
          </span>
        </div>

        <ContributionSkyline
          title="Clinical Activity Log (Past 365 Days)"
          unit="medication event"
          unitPlural="medication events"
          palette="github"
          defaultView="3d"
        />
      </div>

      {/* Current Medication List & Safety Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medication Table (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-700" />
              Current Medication List
            </h3>
            <Link
              to="/medications"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Manage all ({medications.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingState rows={3} />
          ) : (
            <MedicineTable
              medications={medications.slice(0, 5)}
              onDelete={handleDeleteMedication}
              onCheckSafety={(med) => navigate(`/safety-checker?add=${med.medicine_id || ""}`)}
            />
          )}
        </div>

        {/* Safety Summary / High Priority Alerts (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Safety Summary
            </h3>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {summaryAlerts.length === 0 ? (
              <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center">
                <ShieldCheck className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">No Active High Alerts</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Run a medication safety check whenever adding a new treatment.
                </p>
                <Link
                  to="/safety-checker"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium"
                >
                  Screen Medications
                </Link>
              </div>
            ) : (
              summaryAlerts.slice(0, 3).map((alert) => (
                <SafetyAlertCard key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Clinical Hub */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-850 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold tracking-tight">Need immediate medicine intelligence?</h4>
          <p className="text-xs text-teal-200/80 mt-0.5">
            Use OCR scanning for prescription packaging or consult the evidence-based AI assistant.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/scanner"
            className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
          >
            <Scan className="w-3.5 h-3.5" />
            OCR Package Scan
          </Link>
          <Link
            to="/assistant"
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition flex items-center gap-1.5 shadow"
          >
            <Bot className="w-3.5 h-3.5 text-teal-700" />
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
