import axiosClient from './axiosClient'
import type {
  ApiResponse,
  PaymentDTO,
  PaymentMethodType,
  PaymentStatus,
  RefundDTO,
} from '../types'

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PROCESSING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDING: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn tiền một phần',
  REFUND_FAILED: 'Hoàn tiền thất bại',
  CANCELLED: 'Đã hủy',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f5c842',
  PROCESSING: '#82c4f5',
  PAID: '#4caf50',
  FAILED: '#ff5252',
  REFUNDING: '#c97df5',
  REFUNDED: '#9e9e9e',
  PARTIALLY_REFUNDED: '#ff9800',
  REFUND_FAILED: '#ff5252',
  CANCELLED: '#9e9e9e',
}

export const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  COD: 'COD (Nhận hàng trả tiền)',
  PAYPAL: 'PayPal',
  STRIPE: 'Visa/Mastercard',
  VNPAY: 'VNPay',
  MOMO: 'Ví MoMo',
  ZALOPAY: 'Ví ZaloPay',
}

export const paymentApi = {
  /**
   * Initiate Payment for an order
   */
  initiatePayment: (payload: {
    orderId: string
    amount: number
    provider: 'MOMO' | 'PAYPAL' | 'STRIPE' | 'COD' | 'VNPAY' | 'ZALOPAY'
    methodType: PaymentMethodType
    returnUrl?: string
    cancelUrl?: string
  }) =>
    axiosClient.post<
      ApiResponse<{
        paymentId: string
        orderId: string
        provider: string
        redirectUrl?: string
        status: string
      }>
    >('/payments', payload),

  /**
   * List own payments (buyer)
   */
  listMyPayments: (params?: {
    status?: PaymentStatus | string
    page?: number
    size?: number
  }) =>
    axiosClient.get<ApiResponse<PaymentDTO[]>>('/payments/my', { params }),

  /**
   * Get payment details by ID (buyer view)
   */
  getById: (paymentId: string) =>
    axiosClient.get<ApiResponse<PaymentDTO>>(`/payments/${paymentId}`),

  /**
   * Request a refund
   */
  requestRefund: (paymentId: string, payload: {
    amount: number
    reason: string
  }) =>
    axiosClient.post<ApiResponse<RefundDTO>>(`/payments/${paymentId}/refund`, payload),

  /**
   * List all payments (admin) with optional status filter
   */
  listPayments: (params?: {
    status?: PaymentStatus | string
    page?: number
    size?: number
  }) =>
    axiosClient.get<
      ApiResponse<{ content: PaymentDTO[]; totalElements: number; totalPages: number; number: number; size: number }>
    >('/payments', { params }),

  /**
   * Get payment details by ID (admin view)
   */
  getPayment: (paymentId: string) =>
    axiosClient.get<ApiResponse<PaymentDTO>>(`/payments/${paymentId}/admin`),

  /**
   * Update payment status manually (admin)
   */
  updateStatusAdmin: (paymentId: string, status: string) =>
    axiosClient.patch<ApiResponse<PaymentDTO>>(`/payments/admin/${paymentId}/status`, null, { params: { status } }),

  /**
   * Delete payment (admin)
   */
  deletePaymentAdmin: (paymentId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/payments/admin/${paymentId}`),

  /**
   * Confirm payment manually (admin/webhook)
   */
  confirmPayment: (paymentId: string, payload: {
    providerReference?: string
    paidAt?: string
  }) =>
    axiosClient.post<ApiResponse<unknown>>(`/payments/${paymentId}/confirm`, payload),

  /**
   * Record payment failure (webhook)
   */
  failPayment: (paymentId: string, payload: {
    failureCode?: string
    failureReason?: string
  }) =>
    axiosClient.post<ApiResponse<null>>(`/payments/${paymentId}/fail`, payload),

  /**
   * Approve a pending refund
   */
  approveRefund: (paymentId: string, refundId: string, payload?: {
    providerRefundId?: string
  }) =>
    axiosClient.post<ApiResponse<RefundDTO>>(
      `/payments/${paymentId}/refunds/${refundId}/approve`,
      payload ?? {},
    ),

  /**
   * Reject a pending refund
   */
  rejectRefund: (paymentId: string, refundId: string, payload: {
    reason: string
  }) =>
    axiosClient.post<ApiResponse<RefundDTO>>(
      `/payments/${paymentId}/refunds/${refundId}/reject`,
      payload,
    ),
}