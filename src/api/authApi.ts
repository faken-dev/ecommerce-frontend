import axiosClient from './axiosClient'
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ChangePasswordRequest,
  UserDTO,
} from '../types'

export const authApi = {
  register: (payload: RegisterRequest) =>
    axiosClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload),

  login: (payload: LoginRequest) =>
    axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  refreshToken: (payload: RefreshTokenRequest) =>
    axiosClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', payload),

  logout: (payload: RefreshTokenRequest) =>
    axiosClient.post<ApiResponse<null>>('/auth/logout', payload),

  logoutAll: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout/all'),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    axiosClient.post<ApiResponse<null>>('/auth/password/forgot', payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    axiosClient.post<ApiResponse<null>>('/auth/password/reset', payload),

  sendOtp: (payload: SendOtpRequest) =>
    axiosClient.post<ApiResponse<null>>('/auth/otp/send', payload),

  verifyOtp: (payload: VerifyOtpRequest) =>
    axiosClient.post<ApiResponse<{ verified: boolean }>>('/auth/otp/verify', payload),

  getMe: () =>
    axiosClient.get<ApiResponse<UserDTO>>('/auth/me'),

  changePassword: (payload: ChangePasswordRequest) =>
    axiosClient.post<ApiResponse<null>>('/auth/password/change', payload),
}
