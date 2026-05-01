import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import type { NotificationDTO } from '../../types';
import styles from './NotificationBell.module.css';

export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, fetchUnreadCount, fetchNotifications, markAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [detailNoti, setDetailNoti] = useState<NotificationDTO | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      // Fetch the most recent 20 for the dropdown
      fetchNotifications(0); 
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: NotificationDTO) => {
    if (n.status === 'UNREAD') {
      await markAsRead(n.id);
    }
    
    if (n.actionUrl) {
      navigate(n.actionUrl);
      setIsOpen(false);
    } else {
      setDetailNoti(n);
      setIsOpen(false);
    }
  };

  const handleViewAll = () => {
    navigate('/buyer/notifications');
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
        <BellIcon />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={styles.badge}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={styles.dropdown}
          >
            <div className={styles.header}>
              <h3>Thông báo</h3>
              <span className={styles.countBadge}>{unreadCount} chưa đọc</span>
            </div>
            
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>
                  <p>Hệ thống sạch sẽ.</p>
                  <span>Không có thông báo nào mới.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`${styles.item} ${n.status === 'UNREAD' ? styles.unread : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className={styles.itemIcon}>{getTypeIcon(n.type)}</div>
                    <div className={styles.itemContent}>
                      <p className={styles.itemTitle}>{n.title}</p>
                      <p className={styles.itemMessage}>{n.message}</p>
                      <span className={styles.itemTime}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.footer}>
              <button onClick={handleViewAll}>XEM TẤT CẢ GIAO THỨC</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailNoti && (
          <div className={styles.modalOverlay} onClick={() => setDetailNoti(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalIcon}>{getTypeIcon(detailNoti.type)}</div>
                <div>
                  <h3 className={styles.modalTitle}>{detailNoti.title}</h3>
                  <span className={styles.modalTime}>{new Date(detailNoti.createdAt).toLocaleString()}</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setDetailNoti(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <p>{detailNoti.content || detailNoti.message}</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.confirmBtn} onClick={() => setDetailNoti(null)}>ĐÃ HIỂU</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'ORDER': return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    );
    case 'PROMO': return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
    );
    case 'SYSTEM': return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
    );
    default: return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8Z"/><path d="M10 12h.01"/><path d="M16 12h.01"/><path d="M4 12h.01"/><path d="M12 15h.01"/><path d="M12 9h.01"/></svg>
    );
  }
};
