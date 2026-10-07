import apiClient from "./axiosInstance"
import { AssistantResponse } from "../types"

export interface AssistantAskPayload {
  question: string
  medicine_context?: string[]
}

export const assistantApi = {
  async ask(payload: AssistantAskPayload): Promise<AssistantResponse> {
    const res = await apiClient.post<AssistantResponse>("/api/assistant/ask", payload)
    return res.data
  },

  async getHistory(): Promise<AssistantResponse[]> {
    const res = await apiClient.get<AssistantResponse[]>("/api/assistant/history")
    return res.data
  },
}

export default assistantApi
