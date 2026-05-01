import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserDTO } from '../types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../lib/constants'
import type { Role, Permission } from '../lib/constants'

interface AuthState {
  /** Auth store has been rehydrated from localStorage */
  _isHydrated: boolean

  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean

  /** Call once after persist rehydrates */
  setHydrated: () => void

  setUser: (user: UserDTO | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  login: (user: UserDTO) => void

  hasRole: (role: Role) => boolean
  hasPermission: (permission: Permission) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      _isHydrated: false,

      user: null,
      isAuthenticated: false,
      isLoading: false,

      setHydrated: () => set({ _isHydrated: true }),

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        set({ user: null, isAuthenticated: false })
      },

      login: (user) => {
        set({ user, isAuthenticated: true })
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },

      hasPermission: (permission) => {
        const { user } = get()
        return user?.permissions?.includes(permission) ?? false
      },
    }),
    {
      name: 'ec-auth',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        // Called after persist reads sessionStorage — mark as ready
        state?.setHydrated()
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)