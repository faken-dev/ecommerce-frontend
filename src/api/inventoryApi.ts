import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface InventoryItemDTO {
  id: string
  productId: string
  variantId?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
}

export interface InventoryLogDTO {
  id: string
  productId: string
  changeAmount: number
  stockAfter: number
  actionType: string
  reason: string
  createdAt: string
}

export interface WarehouseDTO {
  id: string
  sellerId: string
  name: string
  address: string
  active: boolean
  createdAt: string
}

export const inventoryApi = {
  getByProduct: (productId: string) =>
    axiosClient.get<ApiResponse<InventoryItemDTO>>(`/inventory/product/${productId}`),
  
  listAllAdmin: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<InventoryItemDTO[]>>('/inventory/admin/all', { params }),

  listSellerInventory: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<InventoryItemDTO[]>>('/inventory/seller/all', { params }),

  getLogs: (productId: string) =>
    axiosClient.get<ApiResponse<InventoryLogDTO[]>>(`/inventory/admin/logs/${productId}`),

  adjustStock: (productId: string, change: number, action: string, reason: string, variantId?: string) =>
    axiosClient.post<ApiResponse<null>>('/inventory/admin/adjust', {
      productId,
      variantId,
      change,
      action,
      reason
    }),

  getWarehouses: () =>
    axiosClient.get<ApiResponse<WarehouseDTO[]>>('/warehouses'),

  createWarehouse: (data: { name: string; address?: string; active: boolean }) =>
    axiosClient.post<ApiResponse<WarehouseDTO>>('/warehouses', data),

  getStructure: (warehouseId: string) =>
    axiosClient.get<ApiResponse<any[]>>(`/warehouses/${warehouseId}/structure`),

  addZone: (warehouseId: string, name: string, description: string) =>
    axiosClient.post<ApiResponse<void>>(`/warehouses/${warehouseId}/zones`, { name, description }),

  addSlot: (zoneId: string, name: string, capacity: number) =>
    axiosClient.post<ApiResponse<void>>(`/warehouses/zones/${zoneId}/slots`, { name, capacity }),

  updateProductLocation: (productId: string, slotId: string) =>
    axiosClient.put<ApiResponse<void>>(`/inventory/${productId}/location`, { slotId }),
}
