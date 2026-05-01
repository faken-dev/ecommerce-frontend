import { useEffect, useState } from 'react';
import { auditApi } from '../../api/auditApi';
import type { AuditLog } from '../../api/auditApi';
import { Icon } from '../../components/common/Icon';
import { useToast } from '../../hooks/useToast';
import styles from './AdminAuditLogPage.module.css';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { add } = useToast();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditApi.getAuditLogs(page, 20);
      if (response.data.success) {
        setLogs(response.data.data as any);
        if (response.data.page) {
          setTotalPages(response.data.page.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailure;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Lịch sử hệ thống</h1>
          <p>Theo dõi các hoạt động quan trọng của quản trị viên</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchLogs()} disabled={loading}>
          <Icon.RefreshCw className={loading ? styles.spinning : ''} size={18} />
          Làm mới
        </button>
      </header>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Quản trị viên</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Trạng thái</th>
              <th>IP</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>Đang tải...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>Chưa có dữ liệu</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{log.userName}</span>
                      <span className={styles.userId}>{log.userId}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.actionTag}>{log.action}</span>
                  </td>
                  <td>
                    <div className={styles.resourceInfo}>
                      <span className={styles.resourceType}>{log.resourceType}</span>
                      <span className={styles.resourceId}>{log.resourceId}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.ipAddress}</td>
                  <td>
                    <button className={styles.detailBtn} onClick={() => add({ type: 'info', title: 'Payload', message: JSON.stringify(JSON.parse(log.payload || '{}'), null, 2) })}>
                      <Icon.Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
            >
              Trước
            </button>
            <span>Trang {page + 1} / {totalPages}</span>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
