import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from './components/ui/Toast'
import { ChatbotBubble } from './components/common/ChatbotBubble'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { SellerLayout } from './components/layout/SellerLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { useAuthInit } from './hooks/useAuthInit'
import { useAuthStore } from './store/authStore'
import { ROUTES, ROLES } from './lib/constants'
import { useWebSocket } from './hooks/useWebSocket'
import { useWishlistStore } from './store/wishlistStore'

const lazyNamed = (importer: () => Promise<Record<string, unknown>>, exportName: string) =>
  lazy(async () => ({ default: (await importer())[exportName] as React.ComponentType }))

// Auth pages
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage')
const VerifyOtpPage = lazyNamed(() => import('./pages/auth/VerifyOtpPage'), 'VerifyOtpPage')
const ForgotPasswordPage = lazyNamed(() => import('./pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyNamed(() => import('./pages/auth/ResetPasswordPage'), 'ResetPasswordPage')

// Public + Buyer pages (shared layout)
const PublicHomePage = lazyNamed(() => import('./pages/public/PublicHomePage'), 'PublicHomePage')
const ProductDetailPage = lazyNamed(() => import('./pages/public/ProductDetailPage'), 'ProductDetailPage')
const SearchPage = lazyNamed(() => import('./pages/public/SearchPage'), 'SearchPage')
const ContactPage = lazyNamed(() => import('./pages/public/ContactPage'), 'ContactPage')
const BuyerProfilePage = lazyNamed(() => import('./pages/buyer/BuyerProfilePage'), 'BuyerProfilePage')
const BuyerOrdersPage = lazyNamed(() => import('./pages/buyer/BuyerOrdersPage'), 'BuyerOrdersPage')
const CheckoutPage = lazyNamed(() => import('./pages/buyer/CheckoutPage'), 'CheckoutPage')
const CartPage = lazyNamed(() => import('./pages/buyer/CartPage'), 'CartPage')
const PaymentSuccessPage = lazyNamed(() => import('./pages/buyer/PaymentSuccessPage'), 'PaymentSuccessPage')
const NotificationPage = lazyNamed(() => import('./pages/buyer/NotificationPage'), 'NotificationPage')
const WishlistPage = lazyNamed(() => import('./pages/buyer/WishlistPage'), 'WishlistPage')

// Admin pages
const AdminDashboardPage = lazyNamed(() => import('./pages/admin/AdminDashboardPage'), 'AdminDashboardPage')
const AdminUsersPage = lazyNamed(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage')
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'))
const AdminRolesPage = lazyNamed(() => import('./pages/admin/AdminRolesPage'), 'AdminRolesPage')
const AdminProductsPage = lazyNamed(() => import('./pages/admin/AdminProductsPage'), 'AdminProductsPage')
const AdminOrdersPage = lazyNamed(() => import('./pages/admin/AdminOrdersPage'), 'AdminOrdersPage')
const AdminPaymentsPage = lazyNamed(() => import('./pages/admin/AdminPaymentsPage'), 'AdminPaymentsPage')
const AdminVouchersPage = lazyNamed(() => import('./pages/admin/AdminVouchersPage'), 'AdminVouchersPage')
const AdminCategoriesPage = lazyNamed(() => import('./pages/admin/AdminCategoriesPage'), 'AdminCategoriesPage')
const AdminAnalyticsPage = lazyNamed(() => import('./pages/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage')
const AdminNotificationsPage = lazyNamed(() => import('./pages/admin/AdminNotificationsPage'), 'AdminNotificationsPage')
const AdminCmsPage = lazyNamed(() => import('./pages/admin/AdminCmsPage'), 'AdminCmsPage')
const AdminInventoryPage = lazyNamed(() => import('./pages/admin/AdminInventoryPage'), 'AdminInventoryPage')
const AdminWarehousesPage = lazyNamed(() => import('./pages/admin/AdminWarehousesPage'), 'AdminWarehousesPage')
const AdminShippingPage = lazy(() => import('./pages/admin/AdminShippingPage'))
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage')
const AdminAuditLogPage = lazy(() => import('./pages/admin/AdminAuditLogPage'))

// Seller pages
const SellerDashboardPage = lazyNamed(() => import('./pages/seller/SellerDashboardPage'), 'SellerDashboardPage')
const SellerWarehousePage = lazyNamed(() => import('./pages/seller/SellerWarehousePage'), 'SellerWarehousePage')
const SellerProductsPage = lazyNamed(() => import('./pages/seller/SellerProductsPage'), 'SellerProductsPage')
const SellerOrdersPage = lazyNamed(() => import('./pages/seller/SellerOrdersPage'), 'SellerOrdersPage')
const SellerInventoryPage = lazyNamed(() => import('./pages/seller/SellerInventoryPage'), 'SellerInventoryPage')
const SellerVouchersPage = lazyNamed(() => import('./pages/seller/SellerVouchersPage'), 'SellerVouchersPage')
const SellerAnalyticsPage = lazyNamed(() => import('./pages/seller/SellerAnalyticsPage'), 'SellerAnalyticsPage')
const VerifyEmailPage = lazyNamed(() => import('./pages/user/VerifyEmailPage'), 'VerifyEmailPage')

// Legal pages
const TermsPage = lazyNamed(() => import('./pages/legal/TermsPage'), 'TermsPage')
const PrivacyPage = lazyNamed(() => import('./pages/legal/PrivacyPage'), 'PrivacyPage')
const ShippingPolicyPage = lazyNamed(() => import('./pages/legal/ShippingPolicyPage'), 'ShippingPolicyPage')
const WarrantyPage = lazyNamed(() => import('./pages/legal/WarrantyPage'), 'WarrantyPage')
const AboutUsPage = lazyNamed(() => import('./pages/legal/AboutUsPage'), 'AboutUsPage')

// Error pages
const NotFoundPage = lazyNamed(() => import('./pages/error/NotFoundPage'), 'NotFoundPage')
const ForbiddenPage = lazyNamed(() => import('./pages/error/ForbiddenPage'), 'ForbiddenPage')
const UnauthorizedPage = lazyNamed(() => import('./pages/error/UnauthorizedPage'), 'UnauthorizedPage')

// ── Loading spinner while auth store is rehydrating from localStorage ────────
function AuthLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--border)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Main app content (inside BrowserRouter so useNavigate works) ─────────────
function AppContent() {
  useAuthInit() // silent: restores auth from token on first load
  useWebSocket() // Listen for real-time notifications
  
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const fetchWishlist = useWishlistStore(s => s.fetchWishlist)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  return (
    <>
      <Suspense fallback={<AuthLoader />}>
      <Routes>
        {/* Public + Buyer (shared layout with nav) */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<PublicHomePage />} />
          <Route path="/products" element={<SearchPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />

          {/* Protected buyer routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.BUYER_PROFILE} element={<BuyerProfilePage />} />
            <Route path={ROUTES.BUYER_ADDRESSES} element={<Navigate to={ROUTES.BUYER_PROFILE + "?tab=addresses"} replace />} />
            <Route path={ROUTES.BUYER_ORDERS} element={<BuyerOrdersPage />} />
            <Route path={`${ROUTES.BUYER_ORDERS}/:id`} element={<BuyerOrdersPage />} />
            <Route path="/buyer/notifications" element={<NotificationPage />} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Route>

        {/* Auth */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Admin — ROLE_ADMIN only */}
        <Route
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={`${ROUTES.ADMIN_USERS}/:id`} element={<AdminUserDetailPage />} />
          <Route path={ROUTES.ADMIN_ROLES} element={<AdminRolesPage />} />
          <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
          <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
          <Route path={ROUTES.ADMIN_PAYMENTS} element={<AdminPaymentsPage />} />
          <Route path={ROUTES.ADMIN_VOUCHERS} element={<AdminVouchersPage />} />
          <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
          <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/cms" element={<AdminCmsPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path={ROUTES.ADMIN_WAREHOUSES} element={<AdminWarehousesPage />} />
          <Route path={ROUTES.ADMIN_SHIPPING} element={<AdminShippingPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogPage />} />
        </Route>

        {/* Seller — ROLE_SELLER or ROLE_ADMIN */}
        <Route
          element={
            <ProtectedRoute roles={[ROLES.SELLER, ROLES.ADMIN]}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.SELLER_DASHBOARD} element={<SellerDashboardPage />} />
          <Route path={ROUTES.SELLER_PRODUCTS} element={<SellerProductsPage />} />
          <Route path="/seller/inventory" element={<SellerInventoryPage />} />
          <Route path="/seller/warehouse" element={<SellerWarehousePage />} />
          <Route path={ROUTES.SELLER_ORDERS} element={<SellerOrdersPage />} />
          <Route path={`${ROUTES.SELLER_ORDERS}/:id`} element={<SellerOrdersPage />} />
          <Route path={ROUTES.SELLER_VOUCHERS} element={<SellerVouchersPage />} />
          <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
        </Route>

        {/* Buyer routes moved into PublicLayout above */}

        {/* Error pages */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>

      <ToastContainer />
      <ChatbotBubble />
    </>
  )
}

// ── Root App — blocks rendering until Zustand persist is ready ──────────────
export default function App() {
  const _isHydrated = useAuthStore((s) => s._isHydrated)

  if (!_isHydrated) return <AuthLoader />

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}