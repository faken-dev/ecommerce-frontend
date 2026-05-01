import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CartItemDTO {
  id: string
  productId: string
  sellerId: string
  productName?: string
  productImageUrl?: string
  variantId?: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  lineTotal: number
  addedAt: string
}

export interface CartDTO {
  id: string
  buyerId: string
  itemCount: number
  subtotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: CartItemDTO[]
}

// ─── API ────────────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: () =>
    axiosClient.get<ApiResponse<CartDTO>>('/orders/cart'),

  addItem: (payload: {
    productId: string
    variantId?: string
    quantity: number
    unitPrice: number
  }) =>
    axiosClient.post<ApiResponse<CartDTO>>('/orders/cart/items', payload),

  updateItem: (payload: {
    productId: string
    variantId?: string
    quantity: number
  }) =>
    axiosClient.put<ApiResponse<CartDTO>>('/orders/cart/items', payload),

  removeItem: (productId: string, variantId?: string) =>
    axiosClient.delete<ApiResponse<null>>('/orders/cart/items', {
      params: { productId, ...(variantId && { variantId }) },
    }),
}
