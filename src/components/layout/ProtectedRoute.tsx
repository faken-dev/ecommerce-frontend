import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../lib/constants'
import type { Role, Permission } from '../../lib/constants'

// ─── Role-based guard ─────────────────────────────────────────────────────────

interface RoleGuardProps {
  children: React.ReactNode
  roles: Role[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { hasRole, _isHydrated } = useAuthStore()

  if (!_isHydrated) return null // wait for store rehydration

  if (!roles.some((r) => hasRole(r))) {
    return fallback ?? <Navigate to="/403" replace />
  }

  return <>{children}</>
}

// ─── Permission-based guard ───────────────────────────────────────────────────

interface PermissionGuardProps {
  children: React.ReactNode
  permissions: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, _isHydrated } = useAuthStore()

  if (!_isHydrated) return null // wait for store rehydration

  const granted = requireAll
    ? permissions.every((p) => hasPermission(p))
    : permissions.some((p) => hasPermission(p))

  if (!granted) {
    return fallback ?? <Navigate to="/403" replace />
  }

  return <>{children}</>
}

// ─── Auth guard (isAuthenticated, optional role check) ───────────────────────

interface ProtectedRouteProps {
  children?: React.ReactNode
  roles?: Role[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, _isHydrated } = useAuthStore()
  const location = useLocation()

  // Wait for store rehydration from sessionStorage
  if (!_isHydrated) return null

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (roles && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/403" replace />
  }

  // Mandatory email verification gate
  if (useAuthStore.getState().user && !useAuthStore.getState().user?.emailVerified && location.pathname !== ROUTES.VERIFY_EMAIL) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
