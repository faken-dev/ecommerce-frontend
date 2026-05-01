import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

const API_URL = '/system/settings'

export const systemApi = {
  getSettings: () => axiosClient.get<ApiResponse<Record<string, string>>>(API_URL),
  updateSettings: (settings: Record<string, string>) => axiosClient.patch<ApiResponse<void>>(API_URL, settings),
}
