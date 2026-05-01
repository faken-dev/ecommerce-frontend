import React from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '../admin/AdminDashboardPage.module.css'
import tableStyles from '../admin/AdminTablePage.module.css'

export function SellerAnalyticsPage() {
  const { user } = useAuthStore()

  const formatCurrency = (amount: number) => {
    return `₫${new Intl.NumberFormat('vi-VN').format(amount)}`
  }

  // Mock data for seller
  const salesData = [
    { date: '15/04', value: 1200000 },
    { date: '16/04', value: 850000 },
    { date: '17/04', value: 2100000 },
    { date: '18/04', value: 1500000 },
    { date: '19/04', value: 3200000 },
    { date: '20/04', value: 2800000 },
    { date: '21/04', value: 1900000 },
  ]
  const maxSales = Math.max(...salesData.map(d => d.value))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Phân tích Bán hàng</h1>
          <p className={styles.sub}>Theo dõi hiệu quả kinh doanh của Shop {user?.fullName}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Doanh thu tuần này', value: formatCurrency(13550000), delta: '+15.2%', color: 'var(--accent-primary)' },
          { label: 'Đơn hàng mới', value: '42', delta: '+5%', color: '#82c4f5' },
          { label: 'Lượt xem sản phẩm', value: '1,840', delta: '+22%', color: '#f5c842' },
          { label: 'Tỷ lệ chuyển đổi', value: '2.3%', delta: '-0.5%', color: '#f87171' },
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
