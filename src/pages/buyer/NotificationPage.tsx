import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import styles from './NotificationPage.module.css';

export const NotificationPage: React.FC = () => {
  const { notifications, fetchNotifications, markAsRead, loading } = useNotificationStore();
  const [selectedNoti, setSelectedNoti] = React.useState<any | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => n.status === 'UNREAD');
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.subTitle}>HỆ THỐNG GIAO THỨC</span>
          <h1 className={styles.title}>THÔNG BÁO</h1>
        </div>
        <button 
          className={styles.markAllBtn} 
          onClick={handleMarkAllRead}
          disabled={!notifications.some(n => n.status === 'UNREAD')}
        >
          ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
        </button>
      </header>

      <div className={styles.content}>
        {loading && notifications.length === 0 ? (
          <div className={styles.loader}>ĐANG TRUY XUẤT DỮ LIỆU...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <p>KHÔNG CÓ DỮ LIỆU TRUYỀN TẢI</p>
            <span>Hệ thống của bạn hiện đang ở trạng thái sạch.</span>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n, i) => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`${styles.card} ${n.status === 'UNREAD' ? styles.unread : ''}`}
                onClick={async () => {
                  if (n.status === 'UNREAD') await markAsRead(n.id);
                  if (!n.actionUrl) setSelectedNoti(n);
                }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.typeTag}>{n.type}</span>
                  <span className={styles.time}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <h3 className={styles.cardTitle}>{n.title}</h3>
                <p className={styles.cardMessage}>{n.content || n.message}</p>
                {n.actionUrl && (
                  <a href={n.actionUrl} className={styles.actionLink}>
                    TRUY CẬP ĐIỂM KẾT NỐI ◈
                  </a>
                )}
              </motion.div>
            ))}

            {useNotificationStore.getState().currentPage < useNotificationStore.getState().totalPages - 1 && (
              <button 
                className={styles.loadMoreBtn} 
                onClick={() => fetchNotifications(useNotificationStore.getState().currentPage + 1, true)}
                disabled={loading}
              >
                {loading ? 'ĐANG TẢI...' : 'XEM THÊM THÔNG BÁO ▿'}
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedNoti && (
          <div className={styles.modalOverlay} onClick={() => setSelectedNoti(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalType}>{selectedNoti.type}</div>
                <div>
                  <h3 className={styles.modalTitle}>{selectedNoti.title}</h3>
                  <span className={styles.modalTime}>{new Date(selectedNoti.createdAt).toLocaleString()}</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedNoti(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <p>{selectedNoti.content || selectedNoti.message}</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.confirmBtn} onClick={() => setSelectedNoti(null)}>ĐÃ HIỂU</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
