import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface DashboardStatsDTO {
  totalUsers: number
  totalProducts: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockProducts: number
  totalReviews: number
  averageRating: number
  topProducts?: {
    productId: string
    productName: string
    totalSales: number
    totalRevenue: number
  }[]
}

export interface AuditLogDTO {
  id: string
  adminEmail: string
  action: string
  resourceType: string
  details: string
  createdAt: string
}

export const dashboardApi = {
  getAdminStats: () =>
    axiosClient.get<ApiResponse<DashboardStatsDTO>>('/admin/dashboard/stats'),
  
  getAuditLogs: () =>
    axiosClient.get<ApiResponse<AuditLogDTO[]>>('/admin/dashboard/audit-logs'),
    
  getSalesAnalytics: (days: number = 7) =>
    axiosClient.get<ApiResponse<Record<string, number>>>(`/admin/dashboard/analytics/sales?days=${days}`),
}
