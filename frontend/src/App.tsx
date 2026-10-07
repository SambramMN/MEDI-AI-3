import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./components/common/Toast"
import ProtectedRoute from "./components/common/ProtectedRoute"
import AppLayout from "./components/layout/AppLayout"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import MedicineSearchPage from "./pages/MedicineSearchPage"
import MedicineDetailPage from "./pages/MedicineDetailPage"
import SafetyCheckerPage from "./pages/SafetyCheckerPage"
import MedicationListPage from "./pages/MedicationListPage"
import InteractionResultsPage from "./pages/InteractionResultsPage"
import ScannerPage from "./pages/ScannerPage"
import AssistantPage from "./pages/AssistantPage"
import SafetyAlertsPage from "./pages/SafetyAlertsPage"
import ProfilePage from "./pages/ProfilePage"
import AnalyticsPage from "./pages/AnalyticsPage"
import TableauPage from "./pages/TableauPage"

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected SaaS App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/medicines" element={<MedicineSearchPage />} />
              <Route path="/medicines/:id" element={<MedicineDetailPage />} />
              <Route path="/safety-checker" element={<SafetyCheckerPage />} />
              <Route path="/medications" element={<MedicationListPage />} />
              <Route path="/interactions" element={<InteractionResultsPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/alerts" element={<SafetyAlertsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/tableau" element={<TableauPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
