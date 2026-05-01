import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../../api/notificationApi';
import { userApi } from '../../api/userApi';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/common/Icon';
import styles from './AdminNotificationsPage.module.css';

type TargetMode = 'ALL' | 'ROLE' | 'INDIVIDUAL';

export const AdminNotificationsPage: React.FC = () => {
  const { add: addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetMode, setTargetMode] = useState<TargetMode>('ALL');
  
  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    content: '',
    type: 'SYSTEM',
    actionUrl: '',
    targetRole: 'ROLE_BUYER'
  });

  // User Search State
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Search Logic
  const handleUserSearch = useCallback(async (val: string) => {
    if (val.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await userApi.listUsers({ search: val, size: 5 });
      if (res.data.success && res.data.data) {
        // Handle both Array and Page object responses
        const data = res.data.data as any;
        setUserResults(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch && !selectedUser) handleUserSearch(userSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch, selectedUser, handleUserSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      addToast({ type: 'error', message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' });
      return;
    }

    if (targetMode === 'INDIVIDUAL' && !selectedUser) {
      addToast({ type: 'error', message: 'Vui lòng chọn người nhận' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId: targetMode === 'INDIVIDUAL' ? selectedUser.id : undefined,
        broadcast: targetMode !== 'INDIVIDUAL',
        targetRole: targetMode === 'ROLE' ? formData.targetRole : (targetMode === 'ALL' ? 'ALL' : undefined)
      };

      const res = await notificationApi.adminSend(payload);
      if (res.data.success) {
        addToast({ type: 'success', message: 'GIAO THỨC ĐÃ ĐƯỢC PHÁT TÁN THÀNH CÔNG' });
        setFormData({ ...formData, title: '', content: '', actionUrl: '' });
        setSelectedUser(null);
        setUserSearch('');
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi gửi thông báo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.tag}>COMMUNICATION HUB</span>
          <h1 className={styles.title}>QUẢN TRỊ THÔNG ĐIỆP</h1>
          <p className={styles.sub}>Điều phối luồng thông tin và thông báo trên toàn hệ sinh thái.</p>
        </div>
        <div className={styles.statusIndicator}>
          <div className={styles.pulse} />
          <span>HỆ THỐNG TRỰC TUYẾN</span>
        </div>
      </header>

      <div className={styles.grid}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={styles.mainCard}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Target Selection */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>ĐỐI TƯỢNG MỤC TIÊU</label>
              <div className={styles.targetGrid}>
                {[
                  { id: 'ALL', label: 'TẤT CẢ', icon: <Icon.Globe size={18} /> },
                  { id: 'ROLE', label: 'THEO VAI TRÒ', icon: <Icon.Shield size={18} /> },
                  { id: 'INDIVIDUAL', label: 'CÁ NHÂN', icon: <Icon.User size={18} /> }
                ].map((t) => (
                  <button 
                    key={t.id}
                    type="button"
                    className={`${styles.targetBtn} ${targetMode === t.id ? styles.active : ''}`}
                    onClick={() => setTargetMode(t.id as TargetMode)}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode='wait'>
              {targetMode === 'ROLE' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={styles.field}
                >
                  <label>CHỌN VAI TRÒ HỆ THỐNG</label>
                  <select 
                    value={formData.targetRole}
                    onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                    className={styles.select}
                  >
                    <option value="ROLE_BUYER">NGƯỜI MUA (BUYERS)</option>
                    <option value="ROLE_SELLER">NGƯỜI BÁN (SELLERS)</option>
                    <option value="ROLE_ADMIN">QUẢN TRỊ VIÊN (ADMINS)</option>
                  </select>
                </motion.div>
              )}

              {targetMode === 'INDIVIDUAL' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={styles.field}
                >
                  <label>TÌM KIẾM NGƯỜI DÙNG</label>
                  <div className={styles.searchWrapper}>
                    {selectedUser ? (
                      <div className={styles.selectedUser}>
                        <div className={styles.uAvatar}>{selectedUser.fullName?.charAt(0)}</div>
                        <div className={styles.uInfo}>
                          <span className={styles.uName}>{selectedUser.fullName}</span>
                          <span className={styles.uEmail}>{selectedUser.email}</span>
                        </div>
                        <button type="button" onClick={() => setSelectedUser(null)} className={styles.uClear}>
                          <Icon.X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Nhập tên hoặc email để tìm kiếm..."
                          className={styles.input}
                        />
                        {searching && <div className={styles.searchLoader} />}
                        {userResults.length > 0 && (
                          <div className={styles.searchResults}>
                            {userResults.map(u => (
                              <div 
                                key={u.id} 
                                className={styles.searchItem}
                                onClick={() => {
                                  setSelectedUser(u);
                                  setUserResults([]);
                                  setUserSearch('');
                                }}
                              >
                                <strong>{u.fullName}</strong>
                                <span>{u.email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.divider} />

            {/* Content Section */}
            <div className={styles.section}>
              <label className={styles.sectionLabel}>NỘI DUNG THÔNG ĐIỆP</label>
              
              <div className={styles.field}>
                <label>TIÊU ĐỀ GIAO THỨC</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: CẬP NHẬT HỆ THỐNG QUAN TRỌNG"
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label>LOẠI ĐỊNH DANH</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className={styles.select}
                  >
                    <option value="SYSTEM">SYSTEM // HỆ THỐNG</option>
                    <option value="PROMO">PROMO // KHUYẾN MÃI</option>
                    <option value="ORDER">LOGISTICS // VẬN HÀNH</option>
                    <option value="SOCIAL">SOCIAL // TƯƠNG TÁC</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>ĐƯỜNG DẪN ĐIỂM CUỐI (ACTION URL)</label>
                  <input 
                    type="text" 
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                    placeholder="/buyer/orders/..."
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>NỘI DUNG CHI TIẾT</label>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Nhập nội dung thông điệp cần truyền tải..."
                  className={styles.textarea}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Icon.Zap size={18} />
              <span>{loading ? 'ĐANG KHỞI CHẠY GIAO THỨC...' : 'PHÁT TÁN THÔNG ĐIỆP'}</span>
            </button>
          </form>
        </motion.div>

        {/* Preview Panel */}
        <aside className={styles.previewPanel}>
          <div className={styles.previewSticky}>
            <div className={styles.previewLabel}>MÔ PHỎNG HIỂN THỊ</div>
            
            <div className={styles.previewMockup}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot} />
                <div className={styles.mockupTitle}>Hệ thống thông báo</div>
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.notiCard}>
                  <div className={styles.notiIcon}>
                    <Icon.Bell size={20} color="var(--accent-primary)" />
                    <div className={styles.notiDot} />
                  </div>
                  <div className={styles.notiContent}>
                    <div className={styles.notiHeader}>
                      <span className={styles.notiTag}>{formData.type}</span>
                      <span className={styles.notiTime}>VỪA XONG</span>
                    </div>
                    <h4 className={styles.notiTitle}>{formData.title || 'Tiêu đề chưa xác định'}</h4>
                    <p className={styles.notiMsg}>{formData.content || 'Dữ liệu thông điệp đang được chờ xử lý...'}</p>
                    {formData.actionUrl && (
                      <div className={styles.notiAction}>TRUY CẬP ĐƯỜNG DẪN ◈</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <Icon.Clipboard size={16} />
              <p>Thông báo sẽ được gửi qua WebSocket thời gian thực đến toàn bộ người dùng đang trực tuyến và lưu trữ trong cơ sở dữ liệu cho các lần truy cập sau.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
