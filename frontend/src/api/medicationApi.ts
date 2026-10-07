import apiClient from "./axiosInstance"
import { Medication, MedicationCreatePayload } from "../types"

export const medicationApi = {
  async list(): Promise<Medication[]> {
    const res = await apiClient.get<Medication[]>("/api/medications")
    return res.data
  },

  async add(payload: MedicationCreatePayload): Promise<Medication> {
    const res = await apiClient.post<Medication>("/api/medications", payload)
    return res.data
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/api/medications/${id}`)
    return res.data
  },
}

export default medicationApi
