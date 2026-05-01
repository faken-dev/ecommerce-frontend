import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { orderApi } from '../../api/orderApi'
import { paymentApi } from '../../api/paymentApi'
import { shippingApi } from '../../api/shippingApi'
import { useToast } from '../../hooks/useToast'
import { Icon } from '../../components/common/Icon'
import type { OrderSummaryDTO, OrderDetailDTO, ShipmentResponse } from '../../types'
import styles from './BuyerOrdersPage.module.css'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: '#f5c842', label: 'Chờ thanh toán / xác nhận' },
  CONFIRMED: { color: '#82c4f5', label: 'Đã xác nhận' },
  PROCESSING: { color: '#c97df5', label: 'Đang xử lý' },
  SHIPPED: { color: '#82f5a8', label: 'Đang giao hàng' },
  DELIVERED: { color: '#4caf50', label: 'Hoàn thành' },
  CANCELLED: { color: '#ff5252', label: 'Đã hủy' },
}

export function BuyerOrdersPage() {
  const { id: urlOrderId } = useParams()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const { add: addToast } = useToast()

  // Modal states
  const [showDetail, setShowDetail] = useState(false)
  const [detailOrder, setDetailOrder] = useState<OrderDetailDTO | null>(null)
  const [showRefund, setShowRefund] = useState(false)
  const [refundTarget, setRefundTarget] = useState<{ orderId: string; paymentId: string; amount: number } | null>(null)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundReason, setRefundReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentShipment, setCurrentShipment] = useState<ShipmentResponse | null>(null)

  const fetchOrders = (targetPage = page) => {
    setLoading(true)
    orderApi.getMyOrders({ page: targetPage - 1, size: 10 })
      .then(res => {
        if (res.data?.success && res.data.data) {
          const data = res.data.data as any;
          const fetchedOrders = Array.isArray(data) ? data : (data.content || []);
          setOrders(fetchedOrders)
          
          if (res.data.page) {
            setTotalPages(res.data.page.totalPages)
            setTotalElements(res.data.page.totalElements)
          } else if (res.data.data && (res.data.data as any).totalPages !== undefined) {
             const d = res.data.data as any;
             setTotalPages(d.totalPages);
             setTotalElements(d.totalElements);
          }
        } else {
          setOrders([])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      addToast({ type: 'success', message: 'Thanh toán thành công!' })
    }
    // Reset page when filter changes
    setPage(1)
    fetchOrders(1)
  }, [searchParams])

  useEffect(() => {
    fetchOrders(page)
  }, [page])

  // Auto-open detail if ID in URL
  useEffect(() => {
    if (urlOrderId) {
      handleViewDetail(urlOrderId)
    }
  }, [urlOrderId])

  const handleCancel = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    try {
      await orderApi.cancelOrder(orderId, { reason: 'Người dùng yêu cầu hủy' })
      addToast({ type: 'success', message: 'Hủy đơn hàng thành công' })
      fetchOrders()
    } catch {
      addToast({ type: 'error', message: 'Không thể hủy đơn hàng' })
    }
  }

  const handlePayment = async (order: OrderSummaryDTO) => {
    try {
      setSubmitting(true)
      const res = await paymentApi.initiatePayment({
        orderId: order.id,
        amount: order.totalAmount,
        provider: 'VNPAY',
        methodType: 'BANK_TRANSFER',
        returnUrl: window.location.origin + '/payment/success',
        cancelUrl: window.location.origin + '/orders'
      })

      if (res.data.success && res.data.data?.redirectUrl) {
        window.location.href = res.data.data.redirectUrl
      } else {
        addToast({ type: 'error', message: 'Không thể khởi tạo cổng thanh toán' })
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Lỗi thanh toán' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetail = async (orderId: string) => {
    setLoading(true)
    try {
      const res = await orderApi.getById(orderId)
      if (res.data?.success && res.data.data) {
        setDetailOrder(res.data.data)
        setShowDetail(true)
        // Fetch shipment info
        shippingApi.getShipmentByOrder(orderId)
          .then(sRes => {
            if (sRes.data?.success) setCurrentShipment(sRes.data.data)
            else setCurrentShipment(null)
          })
          .catch(() => setCurrentShipment(null))
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể tải chi tiết đơn hàng' })
    } finally {
      setLoading(false)
    }
  }

  const openRefundModal = (order: OrderSummaryDTO) => {
    if (!order.paymentId) return addToast({ type: 'error', message: 'Thông tin thanh toán không hợp lệ' })
    setRefundTarget({ orderId: order.id, paymentId: order.paymentId, amount: order.totalAmount })
    setRefundAmount(order.totalAmount)
    setRefundReason('')
    setShowRefund(true)
  }

  const handleRefundSubmit = async () => {
    if (!refundTarget) return
    if (refundAmount <= 0) return addToast({ type: 'error', message: 'Số tiền hoàn phải lớn hơn 0' })
    if (!refundReason.trim()) return addToast({ type: 'error', message: 'Vui lòng nhập lý do hoàn tiền' })

    setSubmitting(true)
    try {
      await paymentApi.requestRefund(refundTarget.paymentId, { 
        amount: refundAmount, 
        reason: refundReason 
      })
      addToast({ type: 'success', message: 'Đã gửi yêu cầu hoàn tiền' })
      setShowRefund(false)
      fetchOrders()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại'
      addToast({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Data Feed // Orders</h1>
        <div className={styles.sub}>
          <span>{totalElements}</span> RECORDS RETRIEVED FROM DATABASE
        </div>
      </div>

      <div className={styles.orderList}>
        {(!orders || orders.length === 0) && (
          <div className={styles.emptyState}>
            // NO TELEMETRY DATA FOUND IN THIS SECTOR
          </div>
        )}
        
        {orders.map((order, idx) => {
          const cfg = statusConfig[order.status] ?? { color: '#888', label: order.status }
          return (
            <motion.div key={order.id} className={styles.orderCard} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>#{order.id.slice(0,8).toUpperCase()}</span>
                  <span className={styles.orderDate}>STAMP: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={styles.orderStatusGroup}>
                  <span className={styles.statusDot} style={{ background: cfg.color }} />
                  <span className={styles.orderStatus} style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemLabel}>Manifest</span>
                  <span className={styles.itemValue}>{order.itemCount} Units</span>
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemLabel}>Transaction</span>
                  <span className={styles.itemValue} style={{ color: order.paymentStatus === 'PAID' ? 'var(--accent-primary)' : '#f5c842' }}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotalWrap}>
                  <span className={styles.totalLabel}>Gross Total</span>
                  <span className={styles.orderTotal}>{fmt(order.totalAmount)}</span>
                </div>
                <div className={styles.orderActions}>
                  <button className={`${styles.actionBtn} ${styles.btnDetail}`} onClick={() => handleViewDetail(order.id)}>Details</button>
                  {order.status === 'PENDING' && (
                    <>
                      <button className={`${styles.actionBtn} ${styles.btnReorder}`} onClick={() => handlePayment(order)} disabled={submitting}>Pay Now</button>
                      <button className={`${styles.actionBtn} ${styles.btnCancel}`} onClick={() => handleCancel(order.id)}>Abort</button>
                    </>
                  )}
                  {order.paymentStatus === 'PAID' && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'REFUNDED' && (
                    <button className={`${styles.actionBtn} ${styles.btnRefund}`} onClick={() => openRefundModal(order)}>Refund</button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button className={`${styles.actionBtn} ${styles.btnReorder}`}>Re-Sync</button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn} 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            <Icon.ChevronLeft size={16} /> PREV_SECTOR
          </button>
          <div className={styles.pageIndicator}>
            SECTOR {page} / {totalPages}
          </div>
          <button 
            className={styles.pageBtn} 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            NEXT_SECTOR <Icon.ChevronRight size={16} />
          </button>
        </div>
      )}
      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetail && detailOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowDetail(false)}>
            <motion.div 
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Order Details // {detailOrder.id.slice(0, 8).toUpperCase()}</h2>
                  <button className={styles.btnClose} onClick={() => setShowDetail(false)}><Icon.X size={20} /></button>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><Icon.Users size={16} /> Participants</div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Buyer</div>
                      <div className={styles.detailValue}>{detailOrder.buyerName || 'Unknown User'}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Seller</div>
                      <div className={styles.detailValue}>{detailOrder.sellerName || 'Unknown Store'}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><Icon.MapPin size={16} /> Delivery Address</div>
                  <div className={styles.detailValue} style={{ fontSize: '0.9rem', lineHeight: '1.4', marginTop: '0.5rem' }}>
                    {detailOrder.shippingAddress || 'No address provided'}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><Icon.Truck size={16} /> Logistics & Status</div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Status</div>
                      <div className={styles.detailValue} style={{ color: statusConfig[detailOrder.status]?.color }}>
                        {statusConfig[detailOrder.status]?.label || detailOrder.status}
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Payment Status</div>
                      <div className={styles.detailValue}>{detailOrder.paymentStatus}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Method</div>
                      <div className={styles.detailValue}>{detailOrder.paymentMethodName || detailOrder.paymentMethod || 'N/A'}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Created At</div>
                      <div className={styles.detailValue}>{new Date(detailOrder.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                </div>

                {currentShipment && (
                  <div className={styles.detailSection} style={{ background: 'rgba(130, 245, 168, 0.05)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(130, 245, 168, 0.1)', marginBottom: '1.5rem' }}>
                    <div className={styles.detailSectionTitle} style={{ color: '#82f5a8' }}><Icon.Truck size={16} /> Tracking Data</div>
                    <div className={styles.detailGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Carrier</div>
                        <div className={styles.detailValue} style={{ color: '#fff', fontWeight: 700 }}>{currentShipment.carrierName}</div>
                      </div>
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Tracking ID</div>
                        <div className={styles.detailValue} style={{ color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace' }}>{currentShipment.trackingNumber || 'PENDING'}</div>
                      </div>
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Shipment Status</div>
                        <div className={styles.detailValue}>{currentShipment.status}</div>
                      </div>
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Estimated Delivery</div>
                        <div className={styles.detailValue}>{currentShipment.estimatedDeliveryDate ? new Date(currentShipment.estimatedDeliveryDate).toLocaleDateString('vi-VN') : 'TBD'}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><Icon.ShoppingBag size={16} /> Items Manifest</div>
                  <div className={styles.itemList}>
                    {detailOrder.items.map(item => (
                      <div key={item.id} className={styles.productRow}>
                        <div className={styles.productMainInfo}>
                          <img 
                            src={item.productImageUrl || 'https://placehold.co/60'} 
                            alt={item.productName} 
                            className={styles.itemThumb} 
                          />
                          <div className={styles.productInfo}>
                            <span className={styles.productName}>{item.productName}</span>
                            <span className={styles.productMeta}>
                              {item.variantTitle && `${item.variantTitle} · `}
                              x{item.quantity} · {fmt(item.unitPrice)}
                            </span>
                          </div>
                        </div>
                        <span className={styles.productPrice}>{fmt(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Gross Total</span>
                  <span className={styles.totalValue}>{fmt(detailOrder.totalAmount)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refund Request Modal */}
      <AnimatePresence>
        {showRefund && refundTarget && (
          <div className={styles.modalOverlay} onClick={() => setShowRefund(false)}>
            <motion.div 
              className={styles.modal} 
              style={{ maxWidth: 450 }}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Request Refund</h2>
                  <button className={styles.btnClose} onClick={() => setShowRefund(false)}><Icon.X size={20} /></button>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Refund Amount (VND)</label>
                  <input 
                    type="number" 
                    className={styles.input}
                    value={refundAmount}
                    onChange={e => setRefundAmount(Number(e.target.value))}
                    max={refundTarget.amount}
                    min={1}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Max refundable: {fmt(refundTarget.amount)}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason for Refund</label>
                  <textarea 
                    className={styles.textarea}
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    placeholder="Describe why you want a refund..."
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button 
                    className={`${styles.actionBtn} ${styles.btnDetail}`} 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowRefund(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.btnRefund}`}
                    style={{ flex: 2, justifyContent: 'center' }}
                    onClick={handleRefundSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}