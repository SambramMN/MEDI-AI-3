import React, { useState, useEffect } from "react"
import { GitCompare, Filter, ShieldCheck, AlertTriangle, Search, Info } from "lucide-react"
import { interactionApi } from "../api/interactionApi"
import { InteractionAlert, SafetyCheckResponse } from "../types"
import InteractionCard from "../components/common/InteractionCard"
import LoadingState from "../components/common/LoadingState"
import EmptyState from "../components/common/EmptyState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"

export const InteractionResultsPage: React.FC = () => {
  const [history, setHistory] = useState<SafetyCheckResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const data = await interactionApi.getHistory()
        setHistory(data)
      } catch (err) {
        console.error("Could not fetch interaction history:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Flatten all interactions from safety check records
  const allInteractions: InteractionAlert[] = []
  history.forEach((check) => {
    check.interactions?.forEach((item) => {
      allInteractions.push(item)
    })
  })

  // Deduplicate and filter
  const filteredInteractions = allInteractions.filter((item) => {
    const matchesSeverity =
      severityFilter === "all" ||
      item.severity.toLowerCase() === severityFilter.toLowerCase()

    const matchesSearch =
      searchQuery === "" ||
      item.medicine_a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicine_b.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSeverity && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Drug Interaction Screening Results
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review potential pharmacodynamic and pharmacokinetic interactions identified across your checks.
          </p>
        </div>
      </div>

      <MedicalNoticeBanner />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search involved medicine..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Severities</option>
            <option value="high">High / Contraindicated</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low / Informational</option>
          </select>
        </div>
      </div>

      {/* Results grid */}
      {isLoading ? (
        <LoadingState
          message="Retrieving interaction safety records..."
          subMessage="Correlating active drug combinations with clinical guidance"
        />
      ) : filteredInteractions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Identified <strong>{filteredInteractions.length}</strong> potential interaction pair(s)
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Consult a healthcare provider before making any changes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInteractions.map((int, idx) => (
              <InteractionCard key={idx} interaction={int} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No interaction alerts recorded"
          description={
            searchQuery || severityFilter !== "all"
              ? "No interactions matched your current filter criteria."
              : "No potential drug-drug interactions have been identified in your checks. Run a new safety check to screen combinations."
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("")
            setSeverityFilter("all")
          }}
        />
      )}
    </div>
  )
}

export default InteractionResultsPage
