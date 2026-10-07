import apiClient from "./axiosInstance"
import { MedicineDetail, MedicineSearchResponse } from "../types"

export const medicineApi = {
  async search(query: string, page: number = 1, limit: number = 20): Promise<MedicineSearchResponse> {
    const res = await apiClient.get<MedicineSearchResponse>("/api/medicines/search", {
      params: { q: query, page, limit },
    })
    return res.data
  },

  async getById(medicineId: string): Promise<MedicineDetail> {
    const res = await apiClient.get<MedicineDetail>(`/api/medicines/${medicineId}`)
    return res.data
  },
}

export default medicineApi
