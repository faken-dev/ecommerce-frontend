import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { dashboardApi, type DashboardStatsDTO } from '../../api/dashboardApi'
import { PERMISSIONS } from '../../lib/constants'
import styles from './AdminDashboardPage.module.css'
import tableStyles from './AdminTablePage.module.css'
import { Icon } from '../../components/common/Icon'
import { Card } from '../../components/admin/AdminUI'

export function AdminAnalyticsPage() {
  const { user, hasPermission } = useAuthStore()
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null)
  const [salesData, setSalesData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dashboardApi.getAdminStats(),
      dashboardApi.getSalesAnalytics(30)
    ]).then(([statsRes, salesRes]) => {
      if (statsRes.data?.success) setStats(statsRes.data.data)
      if (salesRes.data?.success) setSalesData(salesRes.data.data)
    })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const canViewAnalytics = hasPermission(PERMISSIONS.VIEW_ANALYTICS)
  if (!canViewAnalytics) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: 16 }}>
        <Icon.Shield size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)' }}>Bạn không có quyền xem trang này.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₫${new Intl.NumberFormat('vi-VN').format(amount)}`
  }

  // Process sales data for chart
  const chartPoints = Object.entries(salesData).sort((a, b) => a[0].localeCompare(b[0]))
  const maxSales = Math.max(...Object.values(salesData), 1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Báo cáo Phân tích</h1>
          <p className={styles.sub}>Dữ liệu kinh doanh chi tiết trong 30 ngày qua</p>
        </div>
        <div className={styles.headerActions}>
            <button className={tableStyles.btnGhost} onClick={() => window.print()}>
               <Icon.Plus size={16} /> Xuất báo cáo
            </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Doanh thu (30d)', value: formatCurrency(Object.values(salesData).reduce((a, b) => a + b, 0)), delta: '+12.5%', color: 'var(--accent-primary)' },
          { label: 'Tổng đơn hàng (Hôm nay)', value: stats ? stats.todayOrders : '...', delta: '+8.2%', color: '#82c4f5' },
          { label: 'Tỷ lệ đánh giá', value: stats ? `${stats.averageRating.toFixed(1)}/5.0` : '...', delta: '+5.1%', color: '#f5c842' },
          { label: 'Tổng người dùng', value: stats ? stats.totalUsers : '...', delta: '+14%', color: '#82f5a8' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard} style={{ '--accent': s.color } as React.CSSProperties}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statDelta} style={{ color: s.delta.startsWith('+') ? '#4caf50' : '#ff5252' }}>{s.delta}</span>
            </div>
            <span className={styles.statValue}>{s.value}</span>
          </div>
        ))}
      </div>

      <Card title="Doanh thu (30 ngày gần nhất)" extra={<Icon.BarChart size={20} color="var(--accent-primary)" />}>
        <div style={{ padding: '8px 0' }}>
          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>
          ) : chartPoints.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chưa có dữ liệu kinh doanh</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 250, paddingTop: 20 }}>
              {chartPoints.map(([date, value]) => (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }} className={styles.chartCol}>
                   <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                      <div className={styles.chartTooltip}>{formatCurrency(value)}</div>
                      <div 
                        style={{ 
                          width: '70%', 
                          height: `${(value / maxSales) * 100}%`, 
                          background: 'linear-gradient(to top, rgba(255, 77, 0, 0.1), var(--accent-primary))',
                          borderRadius: '4px 4px 0 0',
                          minHeight: 2,
                          boxShadow: '0 0 10px rgba(255, 77, 0, 0.2)',
                          transition: 'height 1s ease-out',
                          cursor: 'pointer'
                        }} 
                      />
                   </div>
                   <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                     {date.split('-').slice(1).join('/')}
                   </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <Card title="Top Sản phẩm Bán chạy" extra={<Icon.Package size={20} color="#f5c842" />}>
          <div className={tableStyles.tableWrap} style={{ border: 'none' }}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topProducts?.map(p => (
                  <tr key={p.productId}>
                    <td className={tableStyles.userName} style={{ color: '#fff' }}>{p.productName}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{p.totalSales}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatCurrency(p.totalRevenue)}</td>
                  </tr>
                )) || (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu sản phẩm</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Hiệu năng Hệ thống" extra={<Icon.Activity size={20} color="#82c4f5" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Thời gian phản hồi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4caf50' }}>42ms <Icon.Zap size={14} style={{ verticalAlign: 'middle' }} /></div>
             </div>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Tỷ lệ lỗi (API)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4caf50' }}>0.01%</div>
             </div>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>CPU Usage</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f5c842' }}>12.4%</div>
             </div>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Memory</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#82c4f5' }}>1.4GB</div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
