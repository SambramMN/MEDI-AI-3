import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  Pill,
  GitCompare,
  Scan,
  Bot,
  Bell,
  LineChart,
  BarChart,
  User,
  ShieldAlert,
} from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Medicine Search", path: "/medicines", icon: Search },
  { name: "Safety Checker", path: "/safety-checker", icon: ShieldCheck, badge: "Core" },
  { name: "Medication List", path: "/medications", icon: Pill },
  { name: "Interaction Results", path: "/interactions", icon: GitCompare },
  { name: "OCR Scanner", path: "/scanner", icon: Scan },
  { name: "AI Assistant", path: "/assistant", icon: Bot },
  { name: "Safety Alerts", path: "/alerts", icon: Bell },
  { name: "Skyline Analytics", path: "/analytics", icon: LineChart },
  { name: "Tableau Integration", path: "/tableau", icon: BarChart },
  { name: "User Profile", path: "/profile", icon: User },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Clinical Workflows
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-teal-50 text-teal-800 border border-teal-200/70"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-teal-700" : "text-slate-400"
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom medical advisory reminder */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-tight">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              MedSafe AI is an informational screening support platform. Always verify with your doctor.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
