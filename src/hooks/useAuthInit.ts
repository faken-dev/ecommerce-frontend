import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { userApi } from '../api/userApi'

/**
 * MUST be called inside <BrowserRouter>.
 * After hard refresh: rehydrates user from Zustand persist (localStorage).
 * If token exists but no user (edge case), fetch profile from API.
 */
export function useAuthInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const _isHydrated = useAuthStore((s) => s._isHydrated)

  useEffect(() => {
    if (!_isHydrated) return
    // Already have user → nothing to do
    if (isAuthenticated && user) return

    const token = sessionStorage.getItem('ec_access_token')
    if (!token) return

    // Token present but no user → fetch profile to restore session
    userApi.getProfile()
      .then((res) => {
        const profile = res.data.data as any
        if (profile) {
          useAuthStore.getState().setUser(profile)
        }
      })
      .catch(() => {
        // Token invalid → clear everything
        sessionStorage.removeItem('ec_access_token')
        sessionStorage.removeItem('ec_refresh_token')
        useAuthStore.getState().logout()
      })
  }, [_isHydrated])
}
