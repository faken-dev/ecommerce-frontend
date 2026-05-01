import axiosClient from './axiosClient';
import type { ApiResponse, NotificationDTO } from '../types';

const notificationApi = {
  getMyNotifications: (page = 0, size = 20) => {
    return axiosClient.get<ApiResponse<NotificationDTO[]>>(`/notifications?page=${page}&size=${size}`);
  },

  getUnreadCount: () => {
    return axiosClient.get<ApiResponse<number>>('/notifications/unread-count');
  },

  markAsRead: (id: string) => {
    return axiosClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  adminSend: (data: { userId?: string, title: string, content: string, type: string, actionUrl?: string, broadcast: boolean }) => {
    return axiosClient.post<ApiResponse<void>>('/admin/notifications/send', data);
  }
};

export default notificationApi;
