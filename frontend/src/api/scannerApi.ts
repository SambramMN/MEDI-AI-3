import apiClient from "./axiosInstance"
import { ScannerResponse } from "../types"

export const scannerApi = {
  async uploadScan(file: File): Promise<ScannerResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await apiClient.post<ScannerResponse>("/api/scanner/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  },

  async getResult(resultId: string): Promise<ScannerResponse> {
    const res = await apiClient.get<ScannerResponse>(`/api/scanner/${resultId}`)
    return res.data
  },
}

export default scannerApi
