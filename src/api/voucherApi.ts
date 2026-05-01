import axiosClient from './axiosClient'
import type {
  ApiResponse,
  VoucherDTO,
  VoucherStatus,
  DiscountValidationResult,
  CreateVoucherRequest,
  ApplyVoucherRequest,
} from '../types'

export const VOUCHER_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Phần trăm (%)',
  FIXED_AMOUNT: 'Giảm cố định (₫)',
  FREE_SHIPPING: 'Miễn phí vận chuyển',
  BUY_X_GET_Y: 'Mua X tặng Y',
}

export const VOUCHER_SCOPE_LABELS: Record<string, string> = {
  ALL: 'Tất cả sản phẩm',
  SPECIFIC_PRODUCTS: 'Sản phẩm cụ thể',
  SPECIFIC_CATEGORIES: 'Danh mục cụ thể',
  NEW_USERS_ONLY: 'Chỉ người dùng mới',
  LOYAL_USERS_ONLY: 'Khách hàng thân thiết',
}

export const VOUCHER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ kích hoạt',
  ACTIVE: 'Đang hoạt động',
  DISABLED: 'Đã vô hiệu hóa',
  EXPIRED: 'Đã hết hạn',
  DEPLETED: 'Đã hết lượt dùng',
}

export const VOUCHER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f5c842',
  ACTIVE: '#4caf50',
  DISABLED: '#9e9e9e',
  EXPIRED: '#ff5252',
  DEPLETED: '#ff9800',
}

export const voucherApi = {
  /**
   * Validate voucher (preview discount without applying)
   */
  validateVoucher: (params: {
    code: string
    subtotal?: number
    shippingFee?: number
    productIds?: string[]
    categoryIds?: string[]
  }) =>
    axiosClient.get<ApiResponse<DiscountValidationResult>>('/vouchers/validate', { params }),

  /**
   * Apply voucher to an order (commit usage)
   */
  applyVoucher: (payload: ApplyVoucherRequest) =>
    axiosClient.post<ApiResponse<DiscountValidationResult>>('/vouchers/apply', payload),

  /**
   * List all active public vouchers
   */
  listActiveVouchers: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<{ content: VoucherDTO[]; totalElements: number; totalPages: number; number: number; size: number }>>('/vouchers/active', { params }),

  /**
   * Get voucher by code
   */
  getByCode: (code: string) =>
    axiosClient.get<ApiResponse<VoucherDTO>>(`/vouchers/code/${code}`),

  /**
   * List vouchers for current seller
   */
  listMyVouchers: (params?: { status?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<{ content: VoucherDTO[]; totalElements: number; totalPages: number; number: number; size: number }>>('/vouchers/me', { params }),

  /**
   * Activate a voucher (seller)
   */
  activateVoucher: (voucherId: string) =>
    axiosClient.post<ApiResponse<VoucherDTO>>(`/vouchers/${voucherId}/activate`),

  /**
   * Disable a voucher (seller)
   */
  disableVoucher: (voucherId: string) =>
    axiosClient.post<ApiResponse<VoucherDTO>>(`/vouchers/${voucherId}/disable`),

  /**
   * List all vouchers (admin) with optional status filter
   */
  listVouchers: (params?: {
    status?: VoucherStatus | string
    page?: number
    size?: number
  }) =>
    axiosClient.get<
      ApiResponse<{ content: VoucherDTO[]; totalElements: number; totalPages: number; number: number; size: number }>
    >('/vouchers/admin', { params }),

  /**
   * Get voucher details by ID (admin)
   */
  getVoucher: (voucherId: string) =>
    axiosClient.get<ApiResponse<VoucherDTO>>(`/vouchers/${voucherId}`),

  /**
   * Create a new voucher (seller/admin)
   */
  createVoucher: (payload: CreateVoucherRequest) =>
    axiosClient.post<ApiResponse<VoucherDTO>>('/vouchers', payload),

  /**
   * Expire a voucher (admin)
   */
  expireVoucher: (voucherId: string) =>
    axiosClient.post<ApiResponse<VoucherDTO>>(`/vouchers/${voucherId}/expire`),

  /**
   * Delete a voucher (admin)
   */
  deleteVoucher: (voucherId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/vouchers/${voucherId}`),

  /**
   * Collect/Save a voucher to my account
   */
  collectVoucher: (code: string) =>
    axiosClient.post<ApiResponse<VoucherDTO>>(`/vouchers/collect/${code}`),

  /**
   * List my collected vouchers
   */
  listMyCollectedVouchers: (params?: { activeOnly?: boolean; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<{ content: VoucherDTO[]; totalElements: number; totalPages: number }>>('/vouchers/my-collected', { params }),
}