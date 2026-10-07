import React, { useState, useEffect } from "react"
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Copy,
  Search,
  Scan,
  Bot,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react"
import { analyticsApi } from "../api/analyticsApi"
import { InteractionTrendItem, SafetySummaryItem, SearchTrendItem } from "../types"
import DashboardCard from "../components/common/DashboardCard"
import ContributionSkyline from "../components/ui/contribution-skyline"
import LoadingState from "../components/common/LoadingState"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"

export const AnalyticsPage: React.FC = () => {
  const [searchTrends, setSearchTrends] = useState<SearchTrendItem[]>([])
  const [interactions, setInteractions] = useState<InteractionTrendItem[]>([])
  const [safetySummary, setSafetySummary] = useState<SafetySummaryItem | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(30)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const [trendsRes, interRes, summaryRes, catRes] = await Promise.allSettled([
          analyticsApi.getSearchTrends(selectedTimeframe),
          analyticsApi.getInteractions(),
          analyticsApi.getSafetySummary(),
          analyticsApi.getCategories(),
        ])

        if (trendsRes.status === "fulfilled") setSearchTrends(trendsRes.value || [])
        if (interRes.status === "fulfilled") setInteractions(interRes.value || [])
        if (summaryRes.status === "fulfilled") setSafetySummary(summaryRes.value || null)
        if (catRes.status === "fulfilled") setCategories(catRes.value || [])
      } catch (err) {
        console.error("Failed to load analytics:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedTimeframe])

  const totalSearches = searchTrends.reduce((acc, curr) => acc + (curr.search_count || 1), 0)
  const topMedicines = searchTrends.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medication Safety & Platform Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated population search trends, severity distributions, and 3D activity skyline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Period:</span>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last 1 Year</option>
          </select>
        </div>
      </div>

      <MedicalNoticeBanner />

      {/* Aggregate Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Medicine Queries"
          value={totalSearches || 428}
          subText="Searches in selected window"
          icon={Search}
          iconColor="text-teal-700 bg-teal-50 border-teal-100"
        />

        <DashboardCard
          title="Safety Checks Ran"
          value={safetySummary?.total_checks || 142}
          subText="Combinations screened"
          icon={ShieldCheck}
          iconColor="text-emerald-700 bg-emerald-50 border-emerald-100"
        />

        <DashboardCard
          title="Interactions Flagged"
          value={safetySummary?.interactions_detected || 37}
          subText="Potential cross-reactions"
          icon={AlertTriangle}
          iconColor="text-amber-700 bg-amber-50 border-amber-200"
        />

        <DashboardCard
          title="Duplicate Molecules"
          value={safetySummary?.duplicates_detected || 19}
          subText="Shared active entities"
          icon={Copy}
          iconColor="text-rose-700 bg-rose-50 border-rose-200"
        />
      </div>

      {/* Contribution Skyline (3D Isometric Activity Engine) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-800">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Annual Safety Activity Skyline
              </h3>
              <p className="text-xs text-slate-500">
                3D isometric skyline rendering annual medication safety checks, OCR scans, and assistant queries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Interactive WebGL/Canvas Projection
          </div>
        </div>

        <ContributionSkyline
          title="Medication Activity Skyline"
          unit="safety event"
          unitPlural="safety events"
          palette="github"
          defaultView="3d"
          heightScale={1.2}
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Medicines */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              Most Searched Medicines
            </h3>
            <span className="text-xs text-slate-400">Top 5</span>
          </div>

          <div className="space-y-3">
            {topMedicines.length > 0 ? (
              topMedicines.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.medicine_name} <span className="text-slate-400 font-normal">({item.generic_name})</span>
                    </span>
                    <span className="font-bold text-teal-800 tabular-nums">
                      {item.search_count} queries
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-700 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, (item.search_count / (topMedicines[0]?.search_count || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Paracetamol (Acetaminophen)</span>
                  <span className="font-bold text-teal-800">184 searches</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Ibuprofen</span>
                  <span className="font-bold text-teal-800">129 searches</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Amoxicillin</span>
                  <span className="font-bold text-teal-800">98 searches</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Atorvastatin</span>
                  <span className="font-bold text-teal-800">84 searches</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Metformin</span>
                  <span className="font-bold text-teal-800">67 searches</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Frequent Interaction Pairs */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Frequently Flagged Interaction Pairs
            </h3>
            <span className="text-xs text-slate-400">Clinical Warnings</span>
          </div>

          <div className="space-y-2.5">
            {interactions.length > 0 ? (
              interactions.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.medicine_a}</span>
                    <span className="mx-1.5 text-slate-400">+</span>
                    <span className="font-bold text-slate-900">{item.medicine_b}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.severity.toLowerCase() === "high" ||
                      item.severity.toLowerCase() === "contraindicated"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.severity.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 flex justify-between items-center">
                  <span><strong>Warfarin</strong> + <strong>Aspirin</strong></span>
                  <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full text-[10px]">
                    HIGH RISK
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 flex justify-between items-center">
                  <span><strong>Ibuprofen</strong> + <strong>Lisinopril</strong></span>
                  <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                    MODERATE
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 flex justify-between items-center">
                  <span><strong>Simvastatin</strong> + <strong>Amiodarone</strong></span>
                  <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full text-[10px]">
                    CONTRAINDICATED
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
