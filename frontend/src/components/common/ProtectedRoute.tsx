import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingState from "./LoadingState"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState
          message="Authenticating session..."
          subMessage="Connecting to MedSafe AI secure clinical server"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
