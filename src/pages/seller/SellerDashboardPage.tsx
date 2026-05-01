import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../lib/constants'
import { sellerApi, type SellerDashboardStats } from '../../api/sellerApi'
import { orderApi } from '../../api/orderApi'
import type { OrderSummaryDTO } from '../../types'
import styles from './SellerDashboardPage.module.css'

export function SellerDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<SellerDashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderSummaryDTO[]>([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buổi sáng' : hour < 18 ? 'Chiều' : 'Tối'
  const firstName = user?.fullName?.split(' ').slice(-1)[0] ?? 'bạn'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          sellerApi.getDashboardStats(),
          orderApi.listSellerOrders({ size: 5 })
        ])
        setStats(statsRes.data.data)
        setRecentOrders(ordersRes.data.data || [])
      } catch (error) {
        console.error('Failed to load seller dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': case 'COMPLETED': return '#4caf50'
      case 'SHIPPING': case 'DELIVERING': return '#82c4f5'
      case 'CONFIRMED': return '#f5c842'
      case 'CANCELLED': return '#f44336'
      default: return '#ff9800' // PENDING
    }
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  const statsDisplay = [
    { label: 'Sản phẩm của tôi', value: stats?.totalProducts ?? 0, delta: '', color: 'var(--accent-primary)' },
    { label: 'Đơn hàng chờ', value: stats?.pendingOrders ?? 0, delta: '', color: '#f5c842' },
    { label: 'Đơn hàng tháng', value: stats?.monthlyOrders ?? 0, delta: `${stats?.monthlyOrdersDelta.toFixed(1)}%`, color: '#82c4f5' },
    { label: 'Doanh thu tháng', value: formatCurrency(stats?.monthlyRevenue ?? 0), delta: `${stats?.monthlyRevenueDelta.toFixed(1)}%`, color: '#82f5a8' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}, <span className={styles.name}>{firstName}</span></h1>
          <p className={styles.sub}>Cửa hàng của bạn · {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link to={ROUTES.SELLER_PRODUCTS} className={styles.btnPrimary}>+ Thêm sản phẩm mới</Link>
      </div>

      <div className={styles.statsGrid}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className={styles.statCard} style={{ opacity: 0.5, height: 100 }} />)
        ) : (
          statsDisplay.map((s) => (
            <div key={s.label} className={styles.statCard} style={{ '--accent': s.color } as React.CSSProperties}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                {s.delta && <span className={styles.statDelta}>{s.delta}</span>}
              </div>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Đơn hàng gần đây</h2>
          <Link to={ROUTES.SELLER_ORDERS} className={styles.seeAll}>Xem tất cả →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {loading ? (
             <div className={styles.loader}>Đang tải...</div>
          ) : recentOrders.length === 0 ? (
             <div className={styles.empty}>Chưa có đơn hàng nào</div>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>#{o.id.substring(0, 8).toUpperCase()}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{o.buyerName || o.buyerId.substring(0, 8)} · {new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(o.totalAmount)}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${statusColor(o.status)}22`, color: statusColor(o.status), border: `1px solid ${statusColor(o.status)}44` }}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}