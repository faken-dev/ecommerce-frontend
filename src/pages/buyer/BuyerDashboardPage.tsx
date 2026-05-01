import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../lib/constants'
import { orderApi } from '../../api/orderApi'
import { catalogApi, type ProductSummaryDTO } from '../../api/catalogApi'
import { voucherApi } from '../../api/voucherApi'
import { Icon } from '../../components/common/Icon'
import { useToast } from '../../hooks/useToast'
import type { OrderSummaryDTO, VoucherDTO } from '../../types'
import styles from './BuyerDashboardPage.module.css'

export function BuyerDashboardPage() {
  const { user } = useAuthStore()
  const { add } = useToast()
  const [recentOrders, setRecentOrders] = useState<OrderSummaryDTO[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummaryDTO[]>([])
  const [activeVouchers, setActiveVouchers] = useState<VoucherDTO[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.fullName?.split(' ').slice(-1)[0] ?? 'bạn'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buổi sáng tốt lành' : hour < 18 ? 'Chiều vui vẻ' : 'Buổi tối an nhiên'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ordersRes, productsRes, vouchersRes] = await Promise.all([
          orderApi.getMyOrders({ page: 0, size: 3 }),
          catalogApi.listPublic(0, 6),
          voucherApi.listActiveVouchers({ page: 0, size: 4 })
        ])

        if (ordersRes.data?.success) {
          const data = ordersRes.data.data as any
          setRecentOrders(data.content || data || [])
        }
        if (productsRes.data?.success) {
          const data = productsRes.data.data as any
          setFeaturedProducts(data.content || data || [])
        }
        if (vouchersRes.data?.success) {
          const data = vouchersRes.data.data as any
          setActiveVouchers(data.content || data || [])
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return '#4caf50'
      case 'SHIPPED':
      case 'PROCESSING': return '#82c4f5'
      case 'CANCELLED': return '#f44336'
      default: return '#ff9800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao',
      DELIVERED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    }
    return labels[status] || status
  }

  if (loading && (featuredProducts?.length ?? 0) === 0) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.div className={styles.hero} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.avatarLarge}>{user?.fullName?.charAt(0).toUpperCase() ?? 'U'}</div>
          <div>
            <h1 className={styles.greeting}>
              {greeting}, <span className={styles.name}>{firstName}</span>
            </h1>
            <p className={styles.subGreeting}>Rất vui được gặp bạn trở lại · Chúc một ngày tuyệt vời</p>
          </div>
        </div>
      </motion.div>

      {/* Quick nav */}
      <motion.div className={styles.quickNav} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        {[
          { label: 'Hồ sơ', href: ROUTES.BUYER_PROFILE, icon: <Icon.User size={20} /> },
          { label: 'Địa chỉ', href: ROUTES.BUYER_ADDRESSES, icon: <Icon.MapPin size={20} /> },
          { label: 'Đơn hàng', href: ROUTES.BUYER_ORDERS, icon: <Icon.Package size={20} /> },
          { label: 'Cài đặt', href: '#', icon: <Icon.Settings size={20} /> },
        ].map((q) => (
          <Link key={q.label} to={q.href} className={styles.quickCard}>
            <span className={styles.quickIcon}>{q.icon}</span>
            <span className={styles.quickLabel}>{q.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Recent orders */}
      {recentOrders && recentOrders.length > 0 && (
        <motion.div className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Đơn hàng gần đây</h2>
            <Link to={ROUTES.BUYER_ORDERS} className={styles.seeAll}>Xem tất cả →</Link>
          </div>
          <div className={styles.ordersList}>
            {recentOrders.map((o) => {
              const statusColor = getStatusColor(o.status)
              return (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>#{o.id.slice(0, 8)}</span>
                    <span className={styles.orderTime}>{formatDate(o.createdAt)}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderItems}>{o.itemCount} sản phẩm</span>
                    <span className={styles.orderTotal}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                    </span>
                    <span className={styles.orderStatus} style={{ color: statusColor, background: `${statusColor}18`, borderColor: `${statusColor}30` }}>
                      {getStatusLabel(o.status)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Active Vouchers */}
      {activeVouchers && activeVouchers.length > 0 && (
        <motion.div className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mã giảm giá cho bạn</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {activeVouchers.map((v) => (
              <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px dashed var(--accent-primary)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: 18 }}>{v.code}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{v.name}</div>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(v.code); add({ type: 'success', message: 'Đã sao chép mã!' }) }}
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent-primary)', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                >
                  Sao chép
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Products for you */}
      <motion.div className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Gợi ý cho bạn</h2>
        </div>
        <div className={styles.productGrid}>
          {featuredProducts.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className={styles.productCard}>
              <div className={styles.cardImage}>
                <img src={p.imageUrl || 'https://placehold.co/400x400'} alt={p.name} loading="lazy" />
                <span className={styles.cardCategory}>{p.categoryName || 'Sản phẩm'}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.cardDesc}>{p.tags?.join(', ') || 'Sản phẩm cao cấp'}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </span>
                  <button className={styles.cardBtn}>Mua ngay</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}