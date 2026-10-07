import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import MedicalNoticeBanner from "../common/MedicalNoticeBanner"

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
            <Outlet />
          </div>

          <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                © {new Date().getFullYear()} MedSafe AI — Intelligent Medication Safety & Drug Interaction Analytics Platform.
              </p>
              <p className="text-[11px] text-slate-400">
                Informational and clinical support tool. Consult a doctor or pharmacist for medical decisions.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
