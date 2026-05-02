import React from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '../admin/AdminDashboardPage.module.css'
import tableStyles from '../admin/AdminTablePage.module.css'
import { sellerApi } from '../../api/sellerApi'
export function SellerAnalyticsPage() {
  const { user } = useAuthStore()
  const [salesData, setSalesData] = React.useState<{ date: string; value: number }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<any>(null)

  const formatCurrency = (amount: number) => {
    return `₫${new Intl.NumberFormat('vi-VN').format(amount)}`
  }

  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [salesRes, statsRes] = await Promise.all([
          sellerApi.getSalesAnalytics(7),
          sellerApi.getDashboardStats()
        ])

        if (salesRes.data?.success) {
          const raw = salesRes.data.data
          const formatted = Object.entries(raw).map(([date, val]) => ({
            date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            value: val
          }))
          setSalesData(formatted)
        }

        if (statsRes.data?.success) {
          setStats(statsRes.data.data)
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(d => d.value)) : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Phân tích Bán hàng</h1>
          <p className={styles.sub}>Theo dõi hiệu quả kinh doanh của Shop {user?.fullName}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {loading ? (
           Array(4).fill(0).map((_, i) => <div key={i} className={styles.statCard} style={{ opacity: 0.5, height: 100 }} />)
        ) : (
          [
            { label: 'Doanh thu tháng này', value: formatCurrency(stats?.monthlyRevenue ?? 0), delta: `${stats?.monthlyRevenueDelta.toFixed(1) || 0}%`, color: 'var(--accent-primary)' },
            { label: 'Đơn hàng mới', value: stats?.monthlyOrders ?? 0, delta: `${stats?.monthlyOrdersDelta.toFixed(1) || 0}%`, color: '#82c4f5' },
            { label: 'Sản phẩm', value: stats?.totalProducts ?? 0, delta: '', color: '#f5c842' },
            { label: 'Đơn chờ xử lý', value: stats?.pendingOrders ?? 0, delta: '', color: '#f87171' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard} style={{ '--accent': s.color } as React.CSSProperties}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                {s.delta && <span className={styles.statDelta} style={{ color: s.delta.startsWith('+') || parseFloat(s.delta) >= 0 ? '#4caf50' : '#ff5252' }}>{s.delta}</span>}
              </div>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))
        )}
      </div>

      <div className={tableStyles.card}>
        <div className={tableStyles.cardHeader}>
          <h2 className={tableStyles.cardTitle}>📈 Xu hướng Doanh thu (7 ngày)</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {salesData.map((d) => (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
                 <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div 
                      style={{ 
                        width: '60%', 
                        height: `${(d.value / maxSales) * 100}%`, 
                        background: 'linear-gradient(to top, var(--accent-primary)22, var(--accent-primary))',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 2
                      }} 
                      title={`${d.date}: ${formatCurrency(d.value)}`}
                    />
                 </div>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={tableStyles.card}>
        <div className={tableStyles.cardHeader}>
          <h2 className={tableStyles.cardTitle}>📦 Sản phẩm Hiệu suất cao</h2>
        </div>
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={tableStyles.userName}>Sản phẩm A</td>
                <td>15</td>
                <td style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatCurrency(4500000)}</td>
                <td>⭐ 4.8</td>
              </tr>
              <tr>
                <td className={tableStyles.userName}>Sản phẩm B</td>
                <td>12</td>
                <td style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{formatCurrency(3600000)}</td>
                <td>⭐ 4.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
