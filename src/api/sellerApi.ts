import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface SellerDashboardStats {
  totalProducts: number
  pendingOrders: number
  monthlyOrders: number
  monthlyRevenue: number
  monthlyOrdersDelta: number
  monthlyRevenueDelta: number
}

export const sellerApi = {
  getDashboardStats: () =>
    axiosClient.get<ApiResponse<SellerDashboardStats>>('/seller/dashboard/stats'),
  
  getSalesAnalytics: (days: number = 7) =>
    axiosClient.get<ApiResponse<Record<string, number>>>('/seller/dashboard/analytics/sales', { params: { days } }),
}
