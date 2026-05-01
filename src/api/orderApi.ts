import axiosClient from './axiosClient'
import type {
  ApiResponse,
  OrderDetailDTO,
  OrderStatus,
  OrderSummaryDTO,
} from '../types'

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã giao hàng',
  DELIVERED: 'Đã nhận hàng',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn tiền một phần',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f5c842',
  CONFIRMED: '#82c4f5',
  PROCESSING: '#c97df5',
  SHIPPED: '#82f5a8',
  DELIVERED: '#4caf50',
  CANCELLED: '#ff5252',
  REFUNDED: '#9e9e9e',
  PARTIALLY_REFUNDED: '#ff9800',
}

export const orderApi = {
  /**
   * Place a new order
   */
  placeOrder: (payload: {
    sellerId: string;
    shippingAddressId: string;
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
      productName?: string;
      productImageUrl?: string;
      variantTitle?: string;
    }>;
    subtotal: number;
    shippingFee: number;
    taxAmount: number;
    discountAmount?: number;
    currency: string;
    buyerNote?: string;
    voucherCode?: string;
    paymentMethod?: string;
  }) =>
    axiosClient.post<ApiResponse<OrderDetailDTO>>('/orders', payload),

  /**
   * Get current user's orders
   */
  getMyOrders: (params?: { status?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<OrderSummaryDTO[]>>('/orders/my', { params }),

  /**
   * List orders for current seller
   */
  getSellerOrders: (params?: { status?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<OrderSummaryDTO[]>>('/orders/seller', { params }),

  /**
   * List all orders (admin) with optional status filter
   */
  listOrders: (params?: {
    status?: OrderStatus | string
    page?: number
    size?: number
  }) =>
    axiosClient.get<
      ApiResponse<OrderSummaryDTO[]>
    >('/orders/admin', { params }),

  /**
   * Get order details by ID (buyer/seller view)
   */
  getById: (orderId: string) =>
    axiosClient.get<ApiResponse<OrderDetailDTO>>(`/orders/${orderId}`),

  /**
   * Get order details by ID (admin view)
   */
  getOrder: (orderId: string) =>
    axiosClient.get<ApiResponse<OrderDetailDTO>>(`/orders/admin/${orderId}`),

  /**
   * Update order status (admin)
   */
  updateOrderStatus: (orderId: string, payload: {
    newStatus: string
    reason?: string
    metadata?: Record<string, unknown>
  }) =>
    axiosClient.patch<ApiResponse<OrderDetailDTO>>(
      `/orders/admin/${orderId}/status`,
      payload,
    ),

  /**
   * Cancel order (admin)
   */
  cancelOrder: (orderId: string, payload?: { reason?: string }) =>
    axiosClient.post<ApiResponse<OrderDetailDTO>>(
      `/orders/admin/${orderId}/cancel`,
      payload ?? {},
    ),

  /**
   * Update order status (seller/admin) via general endpoint
   */
  updateSellerOrderStatus: (orderId: string, payload: {
    newStatus: string
    reason?: string
    metadata?: Record<string, unknown>
  }, role: 'SELLER' | 'ADMIN' = 'SELLER') =>
    axiosClient.patch<ApiResponse<OrderDetailDTO>>(
      `/orders/${orderId}/status`,
      payload,
      { params: { changedByRole: role } },
    ),

  /**
   * Alias for getSellerOrders
   */
  listSellerOrders: (params?: { status?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<OrderSummaryDTO[]>>('/orders/seller', { params }),

  /**
   * Delete order (admin)
   */
  deleteOrderAdmin: (orderId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/orders/admin/${orderId}`),

  exportOrdersExcel: async (status?: string) => {
    const response = await axiosClient.get('/orders/export/excel', {
      params: { status },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-sach-don-hang-${status || 'all'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
}