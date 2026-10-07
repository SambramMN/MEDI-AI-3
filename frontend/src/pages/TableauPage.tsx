import React, { useState } from "react"
import { BarChart, ExternalLink, Settings, RefreshCw, Shield, Layers, HelpCircle } from "lucide-react"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"

export const TableauPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string>(
    "https://public.tableau.com/views/Superstore/Overview"
  )
  const [customUrlInput, setCustomUrlInput] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"tableau" | "endpoints">("tableau")

  const handleUpdateUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (customUrlInput.trim()) {
      setEmbedUrl(customUrlInput.trim())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tableau Analytics Integration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated enterprise BI portal linking MedSafe database views and embedded Tableau worksheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
            <button
              onClick={() => setActiveTab("tableau")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "tableau"
                  ? "bg-teal-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tableau Dashboard
            </button>
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "endpoints"
                  ? "bg-teal-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SQL Views & Endpoints
            </button>
          </div>
        </div>
      </div>

      <MedicalNoticeBanner />

      {activeTab === "tableau" ? (
        <div className="space-y-4">
          {/* Tableau Embed Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <form onSubmit={handleUpdateUrl} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-xl">
              <span className="text-slate-500 font-semibold whitespace-nowrap">Tableau Viz URL:</span>
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://public.tableau.com/views/..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-medium hover:bg-teal-900 transition shrink-0"
              >
                Load Viz
              </button>
            </form>

            <div className="flex items-center gap-2 text-slate-500 shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                Aggregated / De-identified
              </span>
              <a
                href={embedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-teal-700 transition"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Embed Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-800">
                  MedSafe Clinical Analytics Dashboard
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Connected via PostgreSQL Analytics Views
              </span>
            </div>

            <div className="flex-1 bg-slate-50 relative">
              <iframe
                title="Tableau Healthcare Dashboard"
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : (
        /* Endpoints and direct SQL View info */
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Available PostgreSQL Database Views for Tableau Connector
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Tableau Desktop and Tableau Server can connect directly to PostgreSQL or ingest data via MedSafe AI REST endpoints. All data is aggregated and sanitized for HIPAA/GDPR clinical compliance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="font-bold text-teal-900 text-sm">
                  1. View: vw_search_trends
                </div>
                <p className="text-slate-600">
                  Aggregated searches per medicine, date, drug class, and therapeutic category.
                </p>
                <code className="block p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono">
                  GET /api/analytics/search-trends?days=30
                </code>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="font-bold text-teal-900 text-sm">
                  2. View: vw_interaction_alerts
                </div>
                <p className="text-slate-600">
                  Frequency matrix of drug interaction pairs and their clinical severity distribution.
                </p>
                <code className="block p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono">
                  GET /api/analytics/interactions
                </code>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="font-bold text-teal-900 text-sm">
                  3. View: vw_safety_summary
                </div>
                <p className="text-slate-600">
                  Aggregated check metrics, duplicate ingredient occurrences, and severity breakdown.
                </p>
                <code className="block p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono">
                  GET /api/analytics/safety-summary
                </code>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="font-bold text-teal-900 text-sm">
                  4. View: vw_drug_categories
                </div>
                <p className="text-slate-600">
                  Categorical distribution of medicines by clinical ATC and pharmacological class.
                </p>
                <code className="block p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 font-mono">
                  GET /api/analytics/categories
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableauPage
