import axiosClient from './axiosClient'
import type {
  ApiResponse,
  Address,
  AvatarUpdateResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../types'

const BASE = '/users/me'

export const userApi = {
  getProfile: () =>
    axiosClient.get<ApiResponse<UserProfile>>(`${BASE}`),

  updateProfile: (payload: UpdateProfileRequest) =>
    axiosClient.put<ApiResponse<UserProfile>>(`${BASE}`, payload),

  updateAvatar: (url: string) =>
    axiosClient.put<ApiResponse<AvatarUpdateResponse>>(`${BASE}/avatar`, {
      avatarUrl: url,
    }),

  // Addresses
  getAddresses: () =>
    axiosClient.get<ApiResponse<Address[]>>(`${BASE}/addresses`),

  createAddress: (payload: CreateAddressRequest) =>
    axiosClient.post<ApiResponse<Address>>(`${BASE}/addresses`, payload),

  updateAddress: (addressId: string, payload: UpdateAddressRequest) =>
    axiosClient.put<ApiResponse<Address>>(
      `${BASE}/addresses/${addressId}`,
      payload,
    ),

  deleteAddress: (addressId: string) =>
    axiosClient.delete<ApiResponse<null>>(`${BASE}/addresses/${addressId}`),

  setDefaultAddress: (addressId: string) =>
    axiosClient.put<ApiResponse<null>>(
      `${BASE}/addresses/${addressId}/default`,
    ),

  // Admin
  listUsers: (params?: { role?: string; search?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<any[]>>('/users/admin', { params }),

  createUser: (payload: any) =>
    axiosClient.post<ApiResponse<any>>('/users/admin', payload),

  updateUser: (userId: string, payload: any) =>
    axiosClient.put<ApiResponse<any>>(`/users/admin/${userId}`, payload),

  deleteUser: (userId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/users/admin/${userId}`),

  getUserProfile: (userId: string) =>
    axiosClient.get<ApiResponse<UserProfile>>(`/users/admin/${userId}/profile`),

  exportUsersExcel: async (query?: string) => {
    const response = await axiosClient.get('/users/export/excel', {
      params: { query },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh-sach-nguoi-dung.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
}
