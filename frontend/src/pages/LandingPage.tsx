import React from "react"
import { Link } from "react-router-dom"
import {
  ShieldCheck,
  Search,
  Scan,
  GitCompare,
  Copy,
  Bot,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Lock,
} from "lucide-react"
import Navbar from "../components/layout/Navbar"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/60 via-emerald-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-900 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Intelligent Medication Safety & Drug Interaction Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
              Understand Your Medicines. <br />
              <span className="text-teal-700">Stay Safer.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              MedSafe AI helps you understand medications, identify potential interactions, detect duplicate ingredients, and access trusted medicine information.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/medicines"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search Medicine
              </Link>
              <Link
                to="/safety-checker"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50/60 text-teal-900 font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                Check Medication Safety
              </Link>
            </div>

            <div className="pt-4 max-w-xl mx-auto">
              <MedicalNoticeBanner compact />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1">
              Engineered for Medication Intelligence
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Clinical safety screening that connects verified drug data, OCR package scanning, and explainable safety analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Medicine Intelligence</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Search verified prescription and OTC medications by brand name, generic name, or active ingredients. View indications, warnings, and precautions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interaction Checking</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Multi-drug interaction analysis highlighting high, moderate, and low severity combinations with referenced clinical guidance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Copy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Duplicate Ingredient Detection</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Flag when multiple products share identical active ingredients (e.g. Paracetamol in multi-symptom cold formulations) to prevent accidental overdose.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Medicine Scanner (OCR)</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Upload photos of medication packaging or prescription sheets. Optical character recognition extracts drug names for rapid user confirmation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Medicine Assistant</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Ask questions about drug classes, mechanisms, side effects, and precautions. Built with medical RAG guardrails that refuse diagnosis or prescribing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Medication Analytics & Skyline</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Visualize screening patterns, top searched therapies, and 3D isometric skyline activity maps, alongside Tableau BI integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1">
              How MedSafe AI Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Four structured steps to empower your medication safety awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="text-base font-bold text-slate-900">Search or Scan</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Type the medicine name or upload package photos to identify candidate medications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="text-base font-bold text-slate-900">Review Verified Info</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Access verified active ingredients, indications, common side effects, and storage guidelines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="text-base font-bold text-slate-900">Check Safety</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Run cross-referencing checks against your existing medications for duplicate ingredients or interactions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 relative">
              <span className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center mb-4">
                4
              </span>
              <h4 className="text-base font-bold text-slate-900">Understand Warnings</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Receive plain-language clinical advisories with actionable questions for your physician or pharmacist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Section */}
      <section id="safety-notice" className="py-16 bg-teal-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-800/80 text-teal-300 flex items-center justify-center mx-auto mb-2 border border-teal-700">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Safety & Clinical Boundaries Notice
          </h2>
          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-3xl mx-auto">
            "MedSafe AI is an informational and medication-safety support tool. It does not replace a doctor or pharmacist and does not provide personalized diagnosis or treatment."
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-teal-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Verified Reference Sources
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              No Algorithmic Prescribing
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-400" />
              Secure Tokenized Sessions
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span className="font-semibold text-slate-800">MedSafe AI</span>
            <span>— Intelligent Medication Safety & Drug Interaction Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/medicines" className="hover:text-teal-700">Medicine Directory</Link>
            <Link to="/safety-checker" className="hover:text-teal-700">Safety Checker</Link>
            <Link to="/login" className="hover:text-teal-700">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
