import React, { useState, useEffect } from "react"
import { Bell, Filter, Search, CheckCircle2, AlertTriangle, ShieldCheck, Copy } from "lucide-react"
import { interactionApi } from "../api/interactionApi"
import { SafetyCheckResponse } from "../types"
import SafetyAlertCard, { SafetyAlertItem } from "../components/common/SafetyAlertCard"
import LoadingState from "../components/common/LoadingState"
import EmptyState from "../components/common/EmptyState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const SafetyAlertsPage: React.FC = () => {
  const { success } = useToast()

  const [alerts, setAlerts] = useState<SafetyAlertItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [reviewedIds, setReviewedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("medsafe_reviewed_alerts") || "[]")
    } catch {
      return []
    }
  })

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        const history = await interactionApi.getHistory()

        const extracted: SafetyAlertItem[] = []
        history.forEach((check) => {
          // Interactions
          check.interactions?.forEach((int, i) => {
            const id = `int-${check.check_id}-${i}`
            extracted.push({
              id,
              alertType: "interaction",
              severity: int.severity,
              medicines: [int.medicine_a, int.medicine_b],
              title: `Potential Interaction: ${int.medicine_a} + ${int.medicine_b}`,
              description: int.description,
              recommendation: int.recommendation,
              source: int.source || "FDA & Clinical Pharmacology DB",
              sourceUrl: int.source_url || undefined,
              dateDetected: "Logged in check",
              isReviewed: reviewedIds.includes(id),
            })
          })

          // Duplicates
          check.duplicate_ingredients?.forEach((dup, i) => {
            const id = `dup-${check.check_id}-${i}`
            extracted.push({
              id,
              alertType: "duplicate_ingredient",
              severity: "warning",
              medicines: dup.found_in,
              title: `Duplicate Active Ingredient: ${dup.ingredient}`,
              description: dup.description,
              recommendation:
                "Both products contain this exact chemical entity. Consult a pharmacist to verify cumulative dosage.",
              source: dup.source || "Active Pharmacological Substance Register",
              dateDetected: "Logged in check",
              isReviewed: reviewedIds.includes(id),
            })
          })
        })

        setAlerts(extracted)
      } catch (err) {
        console.error("Could not fetch alerts:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleToggleReviewed = (id: string) => {
    setReviewedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem("medsafe_reviewed_alerts", JSON.stringify(next))
      return next
    })

    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isReviewed: !item.isReviewed } : item))
    )

    success("Status Updated", "Alert review status was saved.")
  }

  // Filter alerts
  const filteredAlerts = alerts.filter((item) => {
    const matchCat =
      categoryFilter === "all" ||
      (categoryFilter === "high" &&
        (item.severity === "high" || item.severity === "contraindicated")) ||
      (categoryFilter === "moderate" &&
        (item.severity === "moderate" || item.severity === "warning")) ||
      (categoryFilter === "duplicates" && item.alertType === "duplicate_ingredient") ||
      (categoryFilter === "unreviewed" && !item.isReviewed)

    const matchSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicines.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchCat && matchSearch
  })

  const highCount = alerts.filter(
    (a) => a.severity === "high" || a.severity === "contraindicated"
  ).length
  const modCount = alerts.filter(
    (a) => a.severity === "moderate" || a.severity === "warning"
  ).length
  const unreviewedCount = alerts.filter((a) => !a.isReviewed).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medication Safety Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized safety warnings, interaction flags, and duplicate active ingredient notices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-semibold border border-rose-200">
            {highCount} High Priority
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            {modCount} Moderate
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {unreviewedCount} Unreviewed
          </span>
        </div>
      </div>

      <MedicalNoticeBanner />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search involved medicines or description..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Alerts</option>
            <option value="high">High Priority Only</option>
            <option value="moderate">Moderate Risk Only</option>
            <option value="duplicates">Duplicate Active Ingredients</option>
            <option value="unreviewed">Unreviewed Only</option>
          </select>
        </div>
      </div>

      {/* Alerts list */}
      {isLoading ? (
        <LoadingState
          message="Compiling safety alerts..."
          subMessage="Evaluating severity levels and clinical recommendations"
        />
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <SafetyAlertCard
              key={alert.id}
              alert={alert}
              onToggleReviewed={handleToggleReviewed}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No safety alerts found"
          description={
            searchQuery || categoryFilter !== "all"
              ? "No alerts match the chosen search query or category filter."
              : "No medication safety alerts are currently active in your records."
          }
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery("")
            setCategoryFilter("all")
          }}
        />
      )}
    </div>
  )
}

export default SafetyAlertsPage
