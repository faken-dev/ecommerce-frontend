export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`

export const ACCESS_TOKEN_KEY = 'ec_access_token'
export const REFRESH_TOKEN_KEY = 'ec_refresh_token'
export const USER_KEY = 'ec_user'

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  BUYER: 'BUYER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// ─── Permissions ──────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // User/Admin
  VIEW_USERS: 'user:read',
  CREATE_USERS: 'user:create',
  UPDATE_USERS: 'user:update',
  DELETE_USERS: 'user:delete',
  MANAGE_USERS: 'user:manage',
  // Role
  VIEW_ROLES: 'role:read',
  CREATE_ROLES: 'role:create',
  UPDATE_ROLES: 'role:update',
  DELETE_ROLES: 'role:delete',
  ASSIGN_ROLES: 'role:assign',
  // RBAC Fine-grained
  VIEW_PERMISSIONS: 'permission:read',
  CREATE_PERMISSIONS: 'permission:create',
  UPDATE_PERMISSIONS: 'permission:update',
  DELETE_PERMISSIONS: 'permission:delete',
  // Product
  VIEW_PRODUCTS: 'product:read',
  CREATE_PRODUCTS: 'product:create',
  UPDATE_PRODUCTS: 'product:update',
  DELETE_PRODUCTS: 'product:delete',
  MANAGE_PRODUCTS: 'product:manage',
  ACTIVATE_PRODUCTS: 'product:activate',
  STOCK_PRODUCTS: 'product:stock',
  // Order
  VIEW_ORDERS: 'order:read',
  CREATE_ORDERS: 'order:create',
  CANCEL_ORDERS: 'order:cancel',
  MANAGE_ORDERS: 'order:manage',
  UPDATE_ORDER_STATUS: 'order:update-status',
  // Payment
  VIEW_PAYMENTS: 'payment:read',
  CREATE_PAYMENTS: 'payment:create',
  CANCEL_PAYMENTS: 'payment:cancel',
  MANAGE_PAYMENTS: 'payment:manage',
  REQUEST_REFUND: 'payment:request-refund',
  REFUND_PAYMENTS: 'payment:refund',
  PAYMENT_WEBHOOK: 'payment:webhook',
  // Voucher
  VIEW_VOUCHERS: 'voucher:read',
  CREATE_VOUCHERS: 'voucher:create',
  UPDATE_VOUCHERS: 'voucher:update',
  DELETE_VOUCHERS: 'voucher:delete',
  APPLY_VOUCHERS: 'voucher:apply',
  MANAGE_VOUCHERS: 'voucher:manage',
  // Category
  VIEW_CATEGORIES: 'category:read',
  CREATE_CATEGORIES: 'category:create',
  UPDATE_CATEGORIES: 'category:update',
  DELETE_CATEGORIES: 'category:delete',
  // Notification
  READ_NOTIFICATIONS: 'notification:read',
  MANAGE_NOTIFICATIONS: 'notification:manage',
  // CMS
  MANAGE_CMS: 'cms:manage',
  // Shipping
  MANAGE_SHIPPING: 'shipping:manage',
  // Analytics
  VIEW_ANALYTICS: 'analytics:read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// ─── Role → Permissions mapping ──────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS, PERMISSIONS.CREATE_USERS, PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_USERS, PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ROLES, PERMISSIONS.CREATE_ROLES, PERMISSIONS.UPDATE_ROLES,
    PERMISSIONS.DELETE_ROLES, PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.CREATE_PRODUCTS, PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS, PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS, PERMISSIONS.CREATE_ORDERS, PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PAYMENTS, PERMISSIONS.CREATE_PAYMENTS, PERMISSIONS.MANAGE_PAYMENTS, PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.VIEW_VOUCHERS, PERMISSIONS.CREATE_VOUCHERS, PERMISSIONS.MANAGE_VOUCHERS,
    PERMISSIONS.VIEW_CATEGORIES, PERMISSIONS.CREATE_CATEGORIES, PERMISSIONS.UPDATE_CATEGORIES, PERMISSIONS.DELETE_CATEGORIES,
  ],
  [ROLES.SELLER]: [
    PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS, PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.UPDATE_ORDER_STATUS,
  ],
  [ROLES.BUYER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDERS,
  ],
}

// ─── Route definitions ───────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  VERIFY_EMAIL: '/verify-email',

  // Buyer (card layout)
  BUYER_DASHBOARD: '/',
  BUYER_PROFILE: '/buyer/profile',
  BUYER_ADDRESSES: '/buyer/addresses',
  BUYER_ORDERS: '/buyer/orders',

  // Seller (sidebar layout)
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ORDERS: '/seller/orders',
  SELLER_VOUCHERS: '/seller/vouchers',

  // Admin (sidebar layout, table-based)
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_VOUCHERS: '/admin/vouchers',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_WAREHOUSES: '/admin/warehouses',
  ADMIN_SHIPPING: '/admin/shipping',

  // Other
  CART: '/cart',
  WISHLIST: '/wishlist',
  PAYMENT_SUCCESS: '/payment/success',
} as const

// ─── Sidebar section labels ──────────────────────────────────────────────────
export const SIDEBAR_ADMIN = {
  MAIN: 'Tổng quan',
  MANAGEMENT: 'Quản lý',
  SYSTEM: 'Hệ thống',
} as const