import React, { createContext, useContext, useEffect, useState } from "react"
import { authApi, LoginPayload, RegisterPayload } from "../api/authApi"
import { User } from "../types"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("medsafe_token"))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshUser = async () => {
    const savedToken = localStorage.getItem("medsafe_token")
    if (!savedToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const me = await authApi.getMe()
      setUser(me)
      localStorage.setItem("medsafe_user", JSON.stringify(me))
    } catch {
      localStorage.removeItem("medsafe_token")
      localStorage.removeItem("medsafe_user")
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (credentials: LoginPayload) => {
    const res = await authApi.login(credentials)
    localStorage.setItem("medsafe_token", res.access_token)
    setToken(res.access_token)
    const me = await authApi.getMe()
    setUser(me)
    localStorage.setItem("medsafe_user", JSON.stringify(me))
  }

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload)
    // Automatically log in after registration
    await login({ email: payload.email, password: payload.password })
  }

  const logout = () => {
    localStorage.removeItem("medsafe_token")
    localStorage.removeItem("medsafe_user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
