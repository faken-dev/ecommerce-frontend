import { create } from 'zustand';
import type { NotificationDTO } from '../types';
import notificationApi from '../api/notificationApi';

interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;
  loading: boolean;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  
  fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: NotificationDTO) => void;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,

  fetchNotifications: async (page = 0, append = false) => {
    set({ loading: true });
    try {
      const response = await notificationApi.getMyNotifications(page);
      if (response.data.success) {
        const newData = response.data.data;
        const pageInfo = response.data.page;
        
        set((state) => ({ 
          notifications: append ? [...state.notifications, ...newData] : newData,
          totalPages: pageInfo?.totalPages || 0,
          totalElements: pageInfo?.totalElements || 0,
          currentPage: pageInfo?.number || 0
        }));
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.success) {
        set({ unreadCount: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  addNotification: (notification: NotificationDTO) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.status === 'UNREAD' ? state.unreadCount + 1 : state.unreadCount,
    }));
  },

  markAsRead: async (id: string) => {
    try {
      const response = await notificationApi.markAsRead(id);
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, status: 'READ' } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },
}));
