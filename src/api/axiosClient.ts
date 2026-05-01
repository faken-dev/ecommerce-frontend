import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../lib/constants'
import type { ApiResponse, AuthTokens } from '../types'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // ✅ credentials sent via body for refresh — no cookie needed
})

// ── Request interceptor ───────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ Never attach Authorization to the refresh endpoint itself
    if (config.url?.includes('/auth/refresh')) return config

    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false
// Queue of callbacks waiting for the new access token
let refreshQueue: Array<(token: string) => void> = []

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token ?? ''))
  refreshQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If there's no original request (e.g. network error) or already retried → reject
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    // ✅ Refresh token call itself returning 401 — stop here, don't loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // 401 Unauthorized → attempt token refresh
    if (error.response?.status === 401) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
        if (!refreshToken) {
          // No refresh token → must re-login
          sessionStorage.removeItem(ACCESS_TOKEN_KEY)
          sessionStorage.removeItem(REFRESH_TOKEN_KEY)
          sessionStorage.removeItem('ec_user')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          // Call refresh — NOTE: this request does NOT have Authorization header
          // (request interceptor skips it for /auth/refresh)
          const { data } = await axiosClient.post<ApiResponse<AuthTokens>>(
            '/auth/refresh',
            { refreshToken },
          )

          const newAccessToken = data.data.accessToken
          sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

          // ✅ Token refreshed successfully — retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          processQueue(newAccessToken)
          isRefreshing = false
          return axiosClient(originalRequest)

        } catch {
          // Refresh failed → clear everything and redirect to login
          processQueue('')
          isRefreshing = false
          sessionStorage.removeItem(ACCESS_TOKEN_KEY)
          sessionStorage.removeItem(REFRESH_TOKEN_KEY)
          sessionStorage.removeItem('ec_user')
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      // Another refresh is already in-flight — queue this request
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push((token: string) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosClient(originalRequest))
          } else {
            reject(new Error('Token refresh failed'))
          }
        })
      }) as unknown as Promise<unknown> as ReturnType<typeof axiosClient>
    }

    return Promise.reject(error)
  },
)

export default axiosClient
