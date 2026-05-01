import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { dashboardApi, type DashboardStatsDTO, type AuditLogDTO } from '../../api/dashboardApi'
import { Icon } from '../../components/common/Icon'
import { Card } from '../../components/admin/AdminUI'
import styles from './AdminDashboardPage.module.css'

const QUICK_LINKS = [
  { label: 'Quản lý Kho', desc: 'Kiểm kê và nhập hàng', icon: <Icon.Package size={20} />, href: '/admin/inventory' },
  { label: 'Banner CMS', desc: 'Quản lý banner trang chủ', icon: <Icon.Image size={20} />, href: '/admin/cms' },
  { label: 'Người dùng', desc: 'Quản lý tài khoản', icon: <Icon.Users size={20} />, href: '/admin/users' },
  { label: 'Báo cáo', desc: 'Phân tích doanh thu', icon: <Icon.BarChart size={20} />, href: '/admin/analytics' },
]

export function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null)
  const [logs, setLogs] = useState<AuditLogDTO[]>([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buổi sáng' : hour < 18 ? 'Chiều' : 'Tối'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dashboardApi.getAdminStats(),
      dashboardApi.getAuditLogs()
    ]).then(([statsRes, logsRes]) => {
      if (statsRes.data?.success) setStats(statsRes.data.data)
      if (logsRes.data?.success) setLogs(logsRes.data.data)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v)

  const statsItems = [
    { label: 'Doanh thu hôm nay', value: stats ? `${fmt(stats.todayRevenue)}đ` : '...', color: '#4ade80' },
    { label: 'Đơn hàng mới', value: stats ? fmt(stats.todayOrders) : '...', color: '#82c4f5' },
    { label: 'Đơn chờ duyệt', value: stats ? fmt(stats.pendingOrders) : '...', color: '#f5c842' },
    { label: 'Sắp hết hàng', value: stats ? fmt(stats.lowStockProducts) : '...', color: '#f87171' },
    { label: 'Đánh giá TB', value: stats ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {stats.averageRating.toFixed(1)} <Icon.Star size={16} color="#f5c842" fill="#f5c842" />
      </span>
    ) : '...', color: '#f582ae' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}, <span className={styles.name}>{user?.fullName?.split(' ').slice(-1)[0]}</span></h1>
          <p className={styles.sub}>Hệ thống đang hoạt động ổn định · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statsItems.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ '--accent': s.color } as React.CSSProperties}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <Card title="Hệ thống Quản trị">
          <div className={styles.quickGrid}>
            {QUICK_LINKS.map((q) => (
              <Link key={q.label} to={q.href} className={styles.quickCard}>
                <span className={styles.quickIcon}>{q.icon}</span>
                <span className={styles.quickLabel}>{q.label}</span>
                <span className={styles.quickDesc}>{q.desc}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Nhật ký Hoạt động" extra={<span className={styles.liveDot} />}>
          <div className={styles.activityList}>
            {loading ? (
              <p className={styles.empty}>Đang tải nhật ký...</p>
            ) : logs.length === 0 ? (
              <p className={styles.empty}>Chưa có hoạt động nào được ghi lại.</p>
            ) : (
              <div className={styles.logs}>
                {logs.map(log => (
                  <div key={log.id} className={styles.logItem}>
                    <div className={styles.logMeta}>
                      <span className={styles.logAdmin}>{log.adminEmail}</span>
                      <span className={styles.logTime}>{new Date(log.createdAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    <p className={styles.logAction}><span className={styles.actionTag}>{log.action}</span> {log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}