// ─── API Response ─────────────────────────────────────────────────────────────
export * from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn?: number
  accessExpiresIn?: number
}

export interface AuthResponse {
  user: UserDTO
  tokens: AuthTokens
}

export interface RegisterResponse {
  user: UserDTO
  message: string
}

export interface UserDTO {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  active: boolean
  emailVerified: boolean
  phoneVerified: boolean
  provider?: string
  roles: string[]
  permissions: string[]
  profilePictureUrl?: string
}

export interface AdminCreateUserRequest {
  email: string
  password?: string
  fullName: string
  phoneNumber?: string
  roles: string[]
  active?: boolean
  emailVerified?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otpCode: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface SendOtpRequest {
  email?: string
  phoneNumber?: string
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP'
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION' | 'LOGIN_MFA'
}

export interface VerifyOtpRequest {
  email?: string
  phoneNumber?: string
  code: string
  purpose: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  userId: string
  fullName: string
  profilePictureUrl?: string
  phoneNumber?: string
  bio?: string
  dateOfBirth?: string
  gender?: Gender
  defaultAddressId?: string
}

export type Gender =
  | 'MALE'
  | 'FEMALE'
  | 'OTHER'
  | 'PREFER_NOT_TO_SAY'

export interface UpdateProfileRequest {
  fullName?: string
  bio?: string
  dateOfBirth?: string
  gender?: Gender
}

export interface AvatarUpdateResponse {
  profilePictureUrl: string
}

// ─── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string
  userId: string
  recipientName: string
  recipientPhone: string
  addressLine: string
  ward: string
  district: string
  province: string
  defaultAddress: boolean
}

export interface CreateAddressRequest {
  recipientName: string
  recipientPhone: string
  addressLine: string
  ward: string
  district: string
  province: string
  defaultAddress?: boolean
}

export interface UpdateAddressRequest {
  recipientName?: string
  recipientPhone?: string
  addressLine?: string
  ward?: string
  district?: string
  province?: string
  defaultAddress?: boolean
}

// ─── Product (placeholder — wire when backend is ready) ───────────────────────

export interface ProductImageDTO {
  id?: string
  url: string
  altText?: string
  sortOrder: number
  primary: boolean
}

export interface ProductVariantDTO {
  id?: string
  sku?: string
  barcode?: string
  title: string
  price: number
  compareAtPrice?: number
  stockQuantity: number
  optionName: string
  optionValue: string
  option2Name?: string
  option2Value?: string
  imageUrl?: string
  active: boolean
}

export interface ProductDTO {
  id: string
  sellerId: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  costPerItem?: number
  stockQuantity: number
  lowStockThreshold?: number
  sku?: string
  barcode?: string
  categoryId: string
  categoryName?: string
  tags: string[]
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  isFeatured: boolean
  visibility: 'PUBLIC' | 'HIDDEN' | 'PASSWORD_PROTECTED'
  metaTitle?: string
  metaDescription?: string
  averageRating: number
  reviewCount: number
  weightKg?: number
  weightUnit?: string
  images: ProductImageDTO[]
  variants: ProductVariantDTO[]
  createdAt: string
  updatedAt: string
}

export interface ProductSummaryDTO {
  id: string
  name: string
  slug: string
  price: number
  stockQuantity: number
  imageUrl?: string
  categoryId: string
  categoryName?: string
  status: string
}

export interface CreateProductRequest {
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  costPerItem?: number
  sku?: string
  barcode?: string
  categoryId: string
  tags: string[]
  visibility: string
  metaTitle?: string
  metaDescription?: string
  weightKg?: number
  weightUnit?: string
  images: ProductImageDTO[]
  variants: ProductVariantDTO[]
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface RoleDTO {
  id: string
  name: string
  description?: string
  permissions: string[]
  userCount: number
  createdAt: string
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderSummaryDTO {
  id: string
  buyerId: string
  buyerName?: string
  sellerId?: string
  sellerName?: string
  status: string
  totalAmount: number
  currency: string
  paymentStatus: string
  paymentId?: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export interface OrderDetailDTO {
  id: string
  buyerId: string
  buyerName?: string
  sellerId: string
  sellerName?: string
  status: string
  shippingAddressId: string
  shippingAddress?: string
  subtotal: number
  shippingFee: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentMethod?: string
  paymentMethodName?: string
  paymentStatus: string
  buyerNote?: string
  sellerNote?: string
  shippingCarrier?: string
  trackingNumber?: string
  cancelWindowSec: number
  buyerCancellable: boolean
  createdAt: string
  updatedAt: string
  items: OrderItemDTO[]
  statusHistory: StatusHistoryDTO[]
}

export interface OrderItemDTO {
  id: string
  productId: string
  productName: string
  productSku?: string
  productImageUrl?: string
  variantId?: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discountAmount: number
  refundedQuantity: number
  refundedAmount: number
}

export interface StatusHistoryDTO {
  id: string
  fromStatus?: string
  toStatus: string
  changedBy?: string
  changedByRole?: string
  reason?: string
  createdAt: string
}

// ─── Shipping ────────────────────────────────────────────────────────────────
export interface ShipmentResponse {
  id: string
  orderId: string
  status: string
  trackingNumber?: string
  carrierName?: string
  recipientName: string
  phone: string
  fullAddress: string
  shippingFee: number
  estimatedDeliveryDate?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUND_FAILED'
  | 'CANCELLED'

export type PaymentProvider = 'COD' | 'PAYPAL' | 'STRIPE' | 'VNPAY' | 'MOMO'
export type PaymentMethodType = 'WALLET' | 'CARD' | 'BANK_TRANSFER' | 'COD'

export interface PaymentDTO {
  id: string
  orderId: string
  buyerId: string
  amount: number
  refundedAmount: number
  maxRefundableAmount: number
  currency: string
  provider: PaymentProvider
  methodType: PaymentMethodType
  providerReference?: string
  status: PaymentStatus
  failureReason?: string
  failureCode?: string
  description?: string
  returnUrl?: string
  cancelUrl?: string
  paidAt?: string
  cancelledAt?: string
  createdAt: string
  refunds: RefundDTO[]
}

export interface RefundDTO {
  id: string
  paymentId: string
  orderId: string
  requestedBy: string
  amount: number
  reason?: string
  status: string
  rejectionReason?: string
  providerRefundId?: string
  approvedAt?: string
  rejectedAt?: string
  completedAt?: string
  failedAt?: string
  createdAt: string
}

// ─── Voucher ─────────────────────────────────────────────────────────────────

export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y'
export type VoucherScope = 'ALL' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_CATEGORIES' | 'NEW_USERS_ONLY' | 'LOYAL_USERS_ONLY'
export type VoucherStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'DEPLETED'

export interface VoucherDTO {
  id: string
  code: string
  name: string
  description?: string
  type: VoucherType
  scope: VoucherScope
  status: VoucherStatus
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount: number
  maxUsageTotal: number
  maxUsagePerUser: number
  currentUsageCount: number
  validFrom?: string
  validTo?: string
  applicableProductIds?: string[]
  applicableCategoryIds?: string[]
  sellerId?: string
  remainingUsage: number
  createdAt: string
}

export interface DiscountValidationResult {
  code: string
  valid: boolean
  discountAmount: number
  message?: string
  voucher?: VoucherDTO
}

export interface ApplyVoucherRequest {
  code: string
  orderId: string
  subtotal: number
  shippingFee: number
  productIds?: string[]
  categoryIds?: string[]
}

export interface CreateVoucherRequest {
  code: string
  name: string
  description?: string
  type: VoucherType
  scope: VoucherScope
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount: number
  maxUsageTotal?: number
  maxUsagePerUser?: number
  validFrom: string
  validTo: string
  applicableCategoryIds?: string[]
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'ORDER' | 'PROMO' | 'SYSTEM' | 'SOCIAL'

export interface NotificationDTO {
  id: string
  userId: string
  title: string
  message?: string
  content?: string
  type: NotificationType
  status: 'UNREAD' | 'READ'
  actionUrl?: string
  createdAt: string
}

// ─── Feedback & Review ────────────────────────────────────────────────────────

export interface ReviewDTO {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  content: string
  images: string[]
  createdAt: string
  comments: ReviewCommentDTO[]
}

export interface RatingSummaryDTO {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface ReviewCommentDTO {
  id: string
  reviewId: string
  userId: string
  userName: string
  content: string
  createdAt: string
  replies: ReviewCommentDTO[]
}

export interface PostReviewRequest {
  productId: string
  orderId: string
  rating: number
  content: string
  images?: string[]
}

export interface PostCommentRequest {
  parentCommentId?: string
  content: string
}
