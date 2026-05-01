import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export const roleApi = {
  listRoles: () =>
    axiosClient.get<ApiResponse<any[]>>('/roles/admin'),

  createRole: (payload: any) =>
    axiosClient.post<ApiResponse<any>>('/roles/admin', payload),

  updateRole: (roleId: string, payload: any) =>
    axiosClient.put<ApiResponse<any>>(`/roles/admin/${roleId}`, payload),

  deleteRole: (roleId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/roles/admin/${roleId}`),
}
