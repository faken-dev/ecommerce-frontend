import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { PERMISSIONS } from '../../lib/constants'
import { orderApi, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../api/orderApi'
import { shippingApi } from '../../api/shippingApi'
import { useSettingsStore } from '../../store/settingsStore'
import { exportInvoicePDF } from '../../lib/invoiceUtils'
import { useToast } from '../../hooks/useToast'
import type { OrderSummaryDTO, OrderDetailDTO, ShipmentResponse } from '../../types'
import { Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css'

const PAGE_SIZE = 10
const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export function AdminOrdersPage() {
  const { hasPermission } = useAuthStore()
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([])
  const [, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const { settings } = useSettingsStore()

  const [showDetail, setShowDetail] = useState(false)
  const [detailOrder, setDetailOrder] = useState<OrderDetailDTO | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  
  const [currentShipment, setCurrentShipment] = useState<ShipmentResponse | null>(null)

  const canUpdate = hasPermission(PERMISSIONS.UPDATE_ORDER_STATUS)

  const fetchOrders = () => {
    setLoading(true)
    const params: any = { page: page - 1, size: PAGE_SIZE }
    if (statusFilter !== 'ALL') params.status = statusFilter

    orderApi.listOrders(params)
      .then(res => {
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          setOrders(Array.isArray(data) ? data : (data as any).content || []);
          
          if (res.data.page) {
            setTotalElements(res.data.page.totalElements)
            setTotalPages(res.data.page.totalPages)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const handleViewDetail = (orderId: string) => {
    setLoading(true)
    orderApi.getOrder(orderId)
      .then(res => {
        if (res.data?.success && res.data.data) {
          setDetailOrder(res.data.data)
          setShowDetail(true)
          // Fetch shipment if exists
          shippingApi.getShipmentByOrder(orderId)
            .then(sRes => {
              if (sRes.data?.success) setCurrentShipment(sRes.data.data)
              else setCurrentShipment(null)
            })
            .catch(() => setCurrentShipment(null))
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải chi tiết' }))
      .finally(() => setLoading(false))
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus) return
    setLoading(true)
    try {
      await orderApi.updateOrderStatus(selectedOrderId, { newStatus, reason: statusReason })
      addToast({ type: 'success', message: 'Cập nhật thành công' })
      setShowStatusModal(false)
      fetchOrders()
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại' })
    } finally { setLoading(false) }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Xác nhận xóa đơn hàng này? Thao tác này không thể hoàn tác.')) return
    setLoading(true)
    try {
      await orderApi.deleteOrderAdmin(orderId)
      addToast({ type: 'success', message: 'Đã xóa đơn hàng' })
      fetchOrders()
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Xóa thất bại' })
    } finally { setLoading(false) }
  }


  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Đơn hàng</h1>
          <p className={styles.pageSub}>Kiểm soát vận hành và trạng thái giao hàng</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {settings.excelExportEnabled && settings.moduleExports.order && (
            <button 
              className={styles.btnGhost} 
              onClick={() => orderApi.exportOrdersExcel(statusFilter === 'ALL' ? undefined : statusFilter)}
              title="Xuất báo cáo kế toán (Excel)"
            >
              <Icon.Download size={18} /> Xuất Excel kế toán
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Tìm theo ID đơn hàng (vd: 8db2...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Tất cả trạng thái</option>
          {ALL_STATUSES.filter(s => s !== 'ALL').map(s => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày tạo</th>
              <th>Giá trị</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : orders?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Không có dữ liệu.</td></tr>
            ) : orders?.filter(o => o.id.includes(search)).map((order) => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#495057' }}>#{order.id.substring(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>Items: {order.itemCount}</div>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                <td style={{ fontWeight: 600, color: '#6366f1' }}>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <Badge type={order.paymentStatus === 'PAID' ? 'success' : 'neutral'}>
                    {order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chờ TT'}
                  </Badge>
                </td>
                <td>
                  <Badge style={{ background: `${ORDER_STATUS_COLORS[order.status]}22`, color: ORDER_STATUS_COLORS[order.status] } as any}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => handleViewDetail(order.id)} title="Chi tiết">
                      <Icon.Eye size={16} />
                    </button>
                    {settings.pdfExportEnabled && settings.moduleExports.order && (
                      <button className={styles.actionBtn} onClick={() => exportInvoicePDF(order.id)} title="In Hóa Đơn" style={{ color: 'var(--accent-primary)' }}>
                        <Icon.FileText size={16} />
                      </button>
                    )}
                    {canUpdate && (
                      <button className={styles.actionBtn} onClick={() => { setSelectedOrderId(order.id); setShowStatusModal(true); }} title="Trạng thái">
                        <Icon.RefreshCw size={16} />
                      </button>
                    )}
                    <button className={styles.actionBtn} onClick={() => handleDeleteOrder(order.id)} style={{ color: '#ff4d4d' }} title="Xóa">
                      <Icon.Trash size={16} />
                    </button>
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
          <button className={styles.btnGhost} disabled={page === 1} onClick={() => setPage(p => p - 1)}><Icon.ChevronLeft size={16} /></button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem' }}>Trang {page} / {totalPages}</span>
          <button className={styles.btnGhost} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><Icon.ChevronRight size={16} /></button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && detailOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowDetail(false)}>
          <div className={styles.modal} style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalContent}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0 }}>Đơn hàng #{detailOrder.id.substring(0, 8).toUpperCase()}</h2>
                  <button className={styles.btnGhost} onClick={() => setShowDetail(false)}><Icon.X size={18} /></button>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Người mua</div>
                     <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{detailOrder.buyerName}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>ID: {detailOrder.buyerId.substring(0,8)}...</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Người bán / Provider</div>
                     <div style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{detailOrder.sellerName}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>ID: {detailOrder.sellerId.substring(0,8)}...</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Thanh toán</div>
                     <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{detailOrder.paymentMethodName || detailOrder.paymentMethod}</div>
                     <Badge type={detailOrder.paymentStatus === 'PAID' ? 'success' : 'warning'} style={{ marginTop: 4 }}>
                        {detailOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                     </Badge>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Trạng thái đơn</div>
                     <Badge style={{ background: `${ORDER_STATUS_COLORS[detailOrder.status]}22`, color: ORDER_STATUS_COLORS[detailOrder.status], fontWeight: 700, marginTop: 4 } as any}>
                        {ORDER_STATUS_LABELS[detailOrder.status]}
                     </Badge>
                  </div>
               </div>

               {detailOrder.shippingAddress && (
                 <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>Địa chỉ giao hàng</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.5 }}>{detailOrder.shippingAddress}</div>
                 </div>
               )}

               <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff', fontWeight: 700 }}>Sản phẩm đã đặt</h3>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                    {detailOrder.items.map(item => (
                      <div key={item.id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>x{item.quantity}</span> · {formatCurrency(item.unitPrice)}
                            </div>
                         </div>
                         <div style={{ fontWeight: 800, color: '#fff' }}>{formatCurrency(item.totalPrice)}</div>
                      </div>
                    ))}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Tạm tính</span>
                       <span style={{ color: '#fff' }}>{formatCurrency(detailOrder.subtotal)}</span>
                    </div>
                    {detailOrder.discountAmount > 0 && (
                      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#ff4d4d' }}>
                         <span>Giảm giá</span>
                         <span style={{ fontWeight: 700 }}>-{formatCurrency(detailOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển</span>
                       <span style={{ color: '#fff' }}>{formatCurrency(detailOrder.shippingFee)}</span>
                    </div>
                    <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tổng thanh toán</span>
                       <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900 }}>{formatCurrency(detailOrder.totalAmount)}</span>
                    </div>
                  </div>
               </div>

                {/* Shipping Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon.Truck size={18} /> Thông tin vận chuyển
                  </h3>
                  <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-elevated)' }}>
                    {currentShipment ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đối tác vận chuyển</div>
                            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1rem' }}>{currentShipment.carrierName}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mã vận đơn</div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', fontFamily: 'monospace' }}>{currentShipment.trackingNumber || 'CHƯA CÓ'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</div>
                            <Badge type="neutral">{currentShipment.status}</Badge>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Địa chỉ giao hàng</div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.4 }}>{currentShipment.fullAddress}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Chưa có thông tin vận chuyển cho đơn hàng này.</p>
                        {/* 
                          canManageShipping && (detailOrder.status === 'CONFIRMED' || detailOrder.status === 'PROCESSING') && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 350 }}>
                              <select 
                                className={styles.select} 
                                value={selectedCarrier} 
                                onChange={e => setSelectedCarrier(e.target.value)}
                                style={{ flex: 1, height: 42, padding: '0 12px' }}
                              >
                                <option value="GHN">GHN (Giao Hàng Nhanh)</option>
                                <option value="SPX">SPX (Shopee Xpress)</option>
                              </select>
                              <button 
                                className={styles.btnPrimary} 
                                onClick={handleCreateShipment}
                                disabled={shippingLoading}
                                style={{ height: 42, padding: '0 20px', whiteSpace: 'nowrap' }}
                              >
                                {shippingLoading ? 'Đang tạo...' : 'Đẩy đơn đối tác'}
                              </button>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã vận đơn sẽ được đối tác phản hồi ngay lập tức</span>
                          </div>
                        )*/}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          (Tính năng đẩy đơn vận chuyển tạm thời tắt để bảo trì API)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  {settings.pdfExportEnabled && settings.moduleExports.order && (
                    <button 
                      className={styles.btnGhost} 
                      onClick={() => exportInvoicePDF(detailOrder.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Icon.FileText size={16} />
                      Xuất hóa đơn (PDF)
                    </button>
                  )}
                  <button className={styles.btnPrimary} onClick={() => setShowDetail(false)}>Đóng</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
           <div className={styles.modal} style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalContent}>
                 <h2 style={{ marginBottom: '1.5rem' }}>Cập nhật đơn hàng</h2>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>Trạng thái mới</label>
                    <select className={styles.selectInput} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                       <option value="">-- Chọn trạng thái --</option>
                       {ALL_STATUSES.filter(s => s !== 'ALL').map(s => (
                         <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
                       ))}
                    </select>
                 </div>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>Ghi chú / Lý do</label>
                    <textarea className={styles.textarea} value={statusReason} onChange={e => setStatusReason(e.target.value)} placeholder="Giao hàng thành công..." />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button className={styles.btnGhost} onClick={() => setShowStatusModal(false)}>Hủy</button>
                    <button className={styles.btnPrimary} disabled={!newStatus || loading} onClick={handleUpdateStatus}>Xác nhận</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
