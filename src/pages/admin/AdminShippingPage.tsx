import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { shippingApi } from '../../api/shippingApi'
import { useToast } from '../../hooks/useToast'
import { Icon } from '../../components/common/Icon'
import type { ShipmentResponse } from '../../types'
import styles from './AdminShippingPage.module.css'

const SHIPPING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ lấy hàng',
  PICKED_UP: 'Đã lấy hàng',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã chuyển hoàn'
}

const SHIPPING_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f5c842',
  PICKED_UP: '#82c4f5',
  SHIPPING: '#c97df5',
  DELIVERED: '#4caf50',
  CANCELLED: '#ff5252',
  RETURNED: '#ff9800'
}

const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

export default function AdminShippingPage() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([])
  const [, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { add: addToast } = useToast()

  // Selection for status update
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const fetchShipments = () => {
    setLoading(true)
    shippingApi.listShipments({ page: page - 1, size: 10 })
      .then(res => {
        if (res.data?.success) {
          const data = res.data.data as any
          setShipments(data.content || [])
          setTotalPages(data.totalPages || 1)
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách vận đơn' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchShipments()
  }, [page])

  const handleUpdateStatus = async (id: string) => {
    if (!newStatus) return
    try {
      await shippingApi.updateStatus(id, newStatus)
      addToast({ type: 'success', message: 'Cập nhật trạng thái thành công' })
      setUpdatingId(null)
      setNewStatus('')
      fetchShipments()
    } catch {
      addToast({ type: 'error', message: 'Cập nhật thất bại' })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Vận chuyển & Logistics</h1>
        <div className={styles.stats}>
          <span>{shipments.length}</span> VẬN ĐƠN TRONG TRANG NÀY
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã vận đơn</th>
              <th>Đơn hàng</th>
              <th>Đối tác</th>
              <th>Người nhận</th>
              <th>Phí ship</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => (
              <motion.tr 
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <td><span className={styles.trackingCode}>{s.trackingNumber || 'CHƯA CÓ'}</span></td>
                <td><span className={styles.orderId}>#{s.orderId.substring(0, 8)}</span></td>
                <td><span className={styles.carrierBadge}>{s.carrierName}</span></td>
                <td>
                  <div className={styles.recipientInfo}>
                    <div style={{ fontWeight: 600 }}>{s.recipientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.phone}</div>
                  </div>
                </td>
                <td>{formatCurrency(s.shippingFee)}</td>
                <td>
                  <span 
                    className={styles.statusDot} 
                    style={{ background: SHIPPING_STATUS_COLORS[s.status] || '#888' }}
                  />
                  {SHIPPING_STATUS_LABELS[s.status] || s.status}
                </td>
                <td>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  {updatingId === s.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <select 
                        className={styles.miniSelect} 
                        value={newStatus} 
                        onChange={e => setNewStatus(e.target.value)}
                      >
                        <option value="">Chọn...</option>
                        {Object.keys(SHIPPING_STATUS_LABELS).map(k => (
                          <option key={k} value={k}>{SHIPPING_STATUS_LABELS[k]}</option>
                        ))}
                      </select>
                      <button className={styles.iconBtn} onClick={() => handleUpdateStatus(s.id)}><Icon.Check size={14} /></button>
                      <button className={styles.iconBtn} onClick={() => setUpdatingId(null)}><Icon.X size={14} /></button>
                    </div>
                  ) : (
                    <button className={styles.btnAction} onClick={() => setUpdatingId(s.id)}>Cập nhật</button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Sau</button>
        </div>
      )}
    </div>
  )
}
