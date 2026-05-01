import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { 
  orderApi, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS 
} from '../../api/orderApi'
import { useToast } from '../../hooks/useToast'
import { Icon } from '../../components/common/Icon'
import type { OrderSummaryDTO } from '../../types'
import { Badge } from '../../components/admin/AdminUI'
import styles from '../admin/AdminProductsPage.module.css'

export function SellerOrdersPage() {
  const { id: urlOrderId } = useParams()
  const { add: addToast } = useToast()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState(urlOrderId || '')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderApi.getSellerOrders({ 
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: page - 1,
        size: 10 
      })
      if (res.data?.success && res.data.data) {
        const data = res.data.data as any
        setOrders(Array.isArray(data) ? data : data.content || [])
        if (res.data.page) {
          setTotalPages(res.data.page.totalPages)
        }
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể tải danh sách đơn hàng' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page, addToast])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await orderApi.updateSellerOrderStatus(orderId, { 
        newStatus, 
        reason: `Cập nhật sang ${ORDER_STATUS_LABELS[newStatus]}` 
      })
      addToast({ type: 'success', message: 'Cập nhật thành công' })
      fetchOrders()
    } catch {
      addToast({ type: 'error', message: 'Cập nhật thất bại' })
    } finally {
      setUpdatingId(null)
    }
  }

  const formatPrice = (p: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Vận hành Đơn hàng</h1>
          <p className={styles.pageSub}>Xử lý đơn hàng mới và theo dõi vận chuyển</p>
        </div>
      </div>

      <div className={styles.filters}>
        <input 
          className={styles.searchInput} 
          placeholder="Tìm theo mã đơn hàng..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select 
          className={styles.select} 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="PROCESSING">Đang chuẩn bị hàng</option>
          <option value="SHIPPED">Đang giao hàng</option>
          <option value="DELIVERED">Đã hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Thao tác nhanh</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : orders.filter(o => o.id.includes(search)).length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Không có đơn hàng nào.</td></tr>
            ) : orders.filter(o => o.id.includes(search)).map((order) => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#495057' }}>#{order.id.substring(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>{order.itemCount} sản phẩm</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: 2 }}>{order.buyerName || 'Khách lẻ'}</div>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                <td style={{ fontWeight: 600, color: '#6366f1' }}>{formatPrice(order.totalAmount)}</td>
                <td>
                   <Badge style={{ background: `${ORDER_STATUS_COLORS[order.status]}22`, color: ORDER_STATUS_COLORS[order.status] }}>
                      {ORDER_STATUS_LABELS[order.status]}
                   </Badge>
                </td>
                <td>
                   <Badge type={order.paymentStatus === 'PAID' ? 'success' : 'neutral'}>
                      {order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chờ TT'}
                   </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {order.status === 'PENDING' && (
                      <button className={styles.btnPrimary} style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} disabled={updatingId === order.id}>Xác nhận</button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button className={styles.btnPrimary} style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#339af0' }} onClick={() => handleUpdateStatus(order.id, 'PROCESSING')} disabled={updatingId === order.id}>Chuẩn bị hàng</button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button className={styles.btnPrimary} style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#22b8cf' }} onClick={() => handleUpdateStatus(order.id, 'SHIPPED')} disabled={updatingId === order.id}>Giao hàng</button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button className={styles.btnGhost} style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#fa5252' }} onClick={() => handleUpdateStatus(order.id, 'CANCELLED')} disabled={updatingId === order.id}>Hủy</button>
                    )}
                    {['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
                      <span style={{ fontSize: '0.8rem', color: '#adb5bd' }}>Đã xử lý</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button className={styles.btnGhost} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <Icon.ChevronLeft size={16} />
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Trang {page} / {totalPages}
          </span>
          <button className={styles.btnGhost} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <Icon.ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
