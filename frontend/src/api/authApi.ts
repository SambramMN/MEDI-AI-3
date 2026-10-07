import apiClient from "./axiosInstance"
import { AuthTokens, User } from "../types"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>("/api/auth/login", payload)
    return res.data
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await apiClient.post<User>("/api/auth/register", payload)
    return res.data
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>("/api/auth/me")
    return res.data
  },
}

export default authApi
