import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  ShieldCheck,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Search,
  Scan,
  Bot,
  Bell,
  BarChart3,
  Pill,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"

interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isCurrent = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Sidebar toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-teal-800 transition">
                MedSafe <span className="text-teal-700 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1 hidden sm:block">
                Clinical Safety Analytics
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Navigation Links for desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link
                to="/medicines"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/medicines")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Search
              </Link>

              <Link
                to="/safety-checker"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/safety-checker")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Safety Checker
              </Link>

              <Link
                to="/scanner"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/scanner")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Scan className="w-3.5 h-3.5 text-slate-400" />
                OCR Scanner
              </Link>

              <Link
                to="/assistant"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/assistant")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-teal-600" />
                AI Assistant
              </Link>

              <Link
                to="/alerts"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/alerts")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Alerts
              </Link>

              <Link
                to="/analytics"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isCurrent("/analytics")
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                Skyline Analytics
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/#features"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Features
              </Link>
              <Link
                to="/#how-it-works"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                How It Works
              </Link>
              <Link
                to="/#safety-notice"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Safety Notice
              </Link>
            </>
          )}
        </nav>

        {/* Right side user status */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                title="Account & Profile"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name || "Patient / Clinician"}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                User Dashboard
              </Link>
              <Link
                to="/medicines"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medicine Search
              </Link>
              <Link
                to="/safety-checker"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medication Safety Checker
              </Link>
              <Link
                to="/medications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medication List
              </Link>
              <Link
                to="/interactions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Interaction Screening
              </Link>
              <Link
                to="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medicine Scanner (OCR)
              </Link>
              <Link
                to="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                AI Medicine Assistant
              </Link>
              <Link
                to="/alerts"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Safety Alerts
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Contribution Skyline & Analytics
              </Link>
              <Link
                to="/tableau"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Tableau Analytics Hub
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile & Health Conditions
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium bg-teal-800 text-white"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
