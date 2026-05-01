import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';

export type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  payload: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
};

export const auditApi = {
  getAuditLogs: (page = 0, size = 20) =>
    axiosClient.get<ApiResponse<AuditLog[]>>(`/admin/audit-logs`, {
      params: { page, size }
    }),
};
