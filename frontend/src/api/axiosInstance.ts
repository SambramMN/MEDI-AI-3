import axios, { AxiosError } from "axios"

// In production, prioritize VITE_API_BASE_URL. In development, fallback to localhost:8000
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL
const isProd = import.meta.env.PROD

export const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, "")
  : isProd
  ? ""
  : "http://localhost:8000"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Attach auth bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("medsafe_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global response interceptor for formatted error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | { message?: string }; message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear expired token if unauthorized
      localStorage.removeItem("medsafe_token")
      localStorage.removeItem("medsafe_user")
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login"
      }
    }

    let errorMessage = "Medicine information or service is currently unavailable."

    if (error.response?.data) {
      const data = error.response.data
      if (typeof data.detail === "string") {
        errorMessage = data.detail
      } else if (typeof data.message === "string") {
        errorMessage = data.message
      }
    } else if (error.message) {
      if (error.message.includes("Network Error") || error.code === "ERR_NETWORK") {
        errorMessage = isProd && !rawBaseUrl
          ? "Backend API is not connected. Please configure VITE_API_BASE_URL in your Vercel project settings."
          : "Unable to connect to the MedSafe AI backend service."
      } else {
        errorMessage = error.message
      }
    }

    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient
