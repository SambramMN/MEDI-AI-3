import apiClient from "./axiosInstance"
import { InteractionTrendItem, SafetySummaryItem, SearchTrendItem } from "../types"

export const analyticsApi = {
  async getSearchTrends(days: number = 30): Promise<SearchTrendItem[]> {
    const res = await apiClient.get<SearchTrendItem[]>("/api/analytics/search-trends", {
      params: { days },
    })
    return res.data
  },

  async getInteractions(): Promise<InteractionTrendItem[]> {
    const res = await apiClient.get<InteractionTrendItem[]>("/api/analytics/interactions")
    return res.data
  },

  async getSafetySummary(): Promise<SafetySummaryItem> {
    const res = await apiClient.get<SafetySummaryItem>("/api/analytics/safety-summary")
    return res.data
  },

  async getCategories(): Promise<any[]> {
    const res = await apiClient.get<any[]>("/api/analytics/categories")
    return res.data
  },
}

export default analyticsApi
