import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ACCESS_TOKEN_KEY } from '../lib/constants';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useToast } from './useToast';

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (import.meta.env.VITE_API_BASE_URL) return `${import.meta.env.VITE_API_BASE_URL}/ws`;
  return '/ws';
};

const WS_URL = getWsUrl();

export const useWebSocket = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userId = useAuthStore(state => state.user?.id);
  const addNotification = useNotificationStore(state => state.addNotification);
  const { add: addToast } = useToast();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Clean up if not authenticated
    if (!isAuthenticated || !userId) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      console.warn('WS: No access token found, skipping connection');
      return;
    }
    
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      if (import.meta.env.DEV) console.log('WS Connected: ' + frame);
      
      // Subscribe to user-specific notifications
      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          addNotification(notification);
          addToast({ 
            type: 'info', 
            title: notification.title, 
            message: notification.message 
          });
        } catch (err) {
          console.error('WS Error parsing message body:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('WS Broker reported error: ' + frame.headers['message']);
      console.error('WS Additional details: ' + frame.body);
    };

    client.onWebSocketClose = () => {
      if (import.meta.env.DEV) console.log('WS Connection closed');
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isAuthenticated, userId, addNotification, addToast]);
};
