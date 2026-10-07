import apiClient from "./axiosInstance"
import { User, UserProfile } from "../types"

export interface UserProfileUpdatePayload {
  age?: number | null
  allergies?: string[]
  existing_conditions?: string[]
}

export interface PasswordChangePayload {
  current_password: string
  new_password: string
}

export const userApi = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>("/api/users/profile")
    return res.data
  },

  async updateProfile(payload: UserProfileUpdatePayload): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>("/api/users/profile", payload)
    return res.data
  },

  async changePassword(payload: PasswordChangePayload): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>("/api/users/change-password", payload)
    return res.data
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>("/api/users/account")
    return res.data
  },
}

export default userApi
