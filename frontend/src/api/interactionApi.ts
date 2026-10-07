import apiClient from "./axiosInstance"
import { SafetyCheckRequest, SafetyCheckResponse } from "../types"

export const interactionApi = {
  async checkSafety(payload: SafetyCheckRequest): Promise<SafetyCheckResponse> {
    const res = await apiClient.post<SafetyCheckResponse>("/api/safety/check", payload)
    return res.data
  },

  async getHistory(): Promise<SafetyCheckResponse[]> {
    const res = await apiClient.get<SafetyCheckResponse[]>("/api/safety/history")
    return res.data
  },
}

export const safetyApi = interactionApi
export default interactionApi
