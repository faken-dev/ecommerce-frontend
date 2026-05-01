import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { PERMISSIONS } from '../../lib/constants'
import { paymentApi, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_PROVIDER_LABELS } from '../../api/paymentApi'
import { useToast } from '../../hooks/useToast'
import type { PaymentDTO } from '../../types'
import { Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css'

const PAGE_SIZE = 10
const ALL_STATUSES = ['ALL', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDING', 'REFUNDED', 'CANCELLED']

export function AdminPaymentsPage() {
  const { hasPermission } = useAuthStore()
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [payments, setPayments] = useState<PaymentDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showDetail, setShowDetail] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null)
  const [refundAction, setRefundAction] = useState<'approve' | 'reject' | null>(null)
  const [refundReason, setRefundReason] = useState('')

  const canManage = hasPermission(PERMISSIONS.MANAGE_PAYMENTS)

  const fetchPayments = () => {
    setLoading(true)
    paymentApi.listPayments({ 
      page: page - 1, 
      size: PAGE_SIZE, 
      status: statusFilter !== 'ALL' ? statusFilter : undefined 
    })
      .then(res => {
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          setPayments(Array.isArray(data) ? data : (data as any).content || []);
          
          if (res.data.page) {
            setTotalElements(res.data.page.totalElements)
            setTotalPages(res.data.page.totalPages)
          }
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách thanh toán' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPayments()
  }, [page, statusFilter])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const handleUpdateStatus = async () => {
    if (!selectedPayment || !newStatus) return
    setLoading(true)
    try {
      await paymentApi.updateStatusAdmin(selectedPayment.id, newStatus)
      addToast({ type: 'success', message: 'Cập nhật trạng thái thành công' })
      setShowStatusModal(false)
      fetchPayments()
    } catch {
      addToast({ type: 'error', message: 'Cập nhật thất bại' })
    } finally { setLoading(false) }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Xác nhận xóa giao dịch này? Thao tác này không thể hoàn tác.')) return
    setLoading(true)
    try {
      await paymentApi.deletePaymentAdmin(paymentId)
      addToast({ type: 'success', message: 'Đã xóa giao dịch' })
      fetchPayments()
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Xóa thất bại' })
    } finally { setLoading(false) }
  }

  const handleRefundAction = async () => {
    if (!selectedPayment || !selectedRefundId || !refundAction) return
    setLoading(true)
    try {
      if (refundAction === 'approve') {
        await paymentApi.approveRefund(selectedPayment.id, selectedRefundId)
        addToast({ type: 'success', message: 'Đã duyệt hoàn tiền' })
      } else {
        await paymentApi.rejectRefund(selectedPayment.id, selectedRefundId, { reason: refundReason })
        addToast({ type: 'success', message: 'Đã từ chối hoàn tiền' })
      }
      setShowRefundModal(false)
      fetchPayments()
    } catch {
      addToast({ type: 'error', message: 'Thao tác thất bại' })
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Thanh toán</h1>
          <p className={styles.pageSub}>Theo dõi dòng tiền và xử lý yêu cầu hoàn tiền</p>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Tìm theo mã thanh toán hoặc mã đơn hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Tất cả trạng thái</option>
          {ALL_STATUSES.filter(s => s !== 'ALL').map(s => (
            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Giao dịch</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Cổng thanh toán</th>
              <th>Trạng thái</th>
              <th>Ngày giao dịch</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && payments?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : payments?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Không có dữ liệu.</td></tr>
            ) : payments?.filter(p => p.id.includes(search) || p.orderId.includes(search)).map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#495057' }}>ID: {p.id.substring(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>Đơn: #{p.orderId.substring(0, 8).toUpperCase()}</div>
                </td>
                <td style={{ fontWeight: 600, color: '#6366f1' }}>{formatCurrency(p.amount)}</td>
                <td><Badge type="neutral">{p.methodType}</Badge></td>
                <td><span style={{ fontSize: '0.875rem' }}>{PAYMENT_PROVIDER_LABELS[p.provider] || p.provider}</span></td>
                <td>
                  <Badge style={{ background: `${PAYMENT_STATUS_COLORS[p.status]}22`, color: PAYMENT_STATUS_COLORS[p.status] } as any}>
                    {PAYMENT_STATUS_LABELS[p.status]}
                  </Badge>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setSelectedPayment(p); setShowDetail(true); }} title="Chi tiết">
                      <Icon.Eye size={16} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => { setSelectedPayment(p); setNewStatus(p.status); setShowStatusModal(true); }} title="Sửa trạng thái">
                      <Icon.Edit size={16} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDeletePayment(p.id)} style={{ color: '#ff4d4d' }} title="Xóa">
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
      {showDetail && selectedPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowDetail(false)}>
          <div className={styles.modal} style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalContent}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0 }}>Giao dịch {selectedPayment.id.substring(0, 8).toUpperCase()}</h2>
                  <button className={styles.btnGhost} onClick={() => setShowDetail(false)}>✕</button>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Số tiền', value: formatCurrency(selectedPayment.amount), color: 'var(--accent-primary)' },
                    { label: 'Cổng thanh toán', value: PAYMENT_PROVIDER_LABELS[selectedPayment.provider] || selectedPayment.provider },
                    { label: 'Phương thức', value: selectedPayment.methodType },
                    { label: 'Trạng thái', value: PAYMENT_STATUS_LABELS[selectedPayment.status], isStatus: true }
                  ].map(item => (
                    <div key={item.label} style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>{item.label}</div>
                       {item.isStatus ? (
                         <Badge style={{ background: `${PAYMENT_STATUS_COLORS[selectedPayment.status]}22`, color: PAYMENT_STATUS_COLORS[selectedPayment.status], fontWeight: 700 } as any}>
                           {item.value}
                         </Badge>
                       ) : (
                         <div style={{ fontWeight: 700, color: item.color || '#fff', fontSize: '0.95rem' }}>{item.value}</div>
                       )}
                    </div>
                  ))}
               </div>

               {selectedPayment.refunds.length > 0 && (
                 <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Yêu cầu hoàn tiền</h3>
                    <div style={{ border: '1px solid #eee', borderRadius: 8 }}>
                      {selectedPayment.refunds.map(refund => (
                        <div key={refund.id} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                              <div style={{ fontWeight: 600 }}>{formatCurrency(refund.amount)}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{refund.reason || 'Không có lý do'}</div>
                           </div>
                           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <Badge type={refund.status === 'APPROVED' ? 'success' : refund.status === 'PENDING' ? 'warning' : 'neutral'}>{refund.status}</Badge>
                              {canManage && refund.status === 'PENDING' && (
                                <>
                                  <button className={styles.actionBtn} style={{ color: '#0ca678' }} onClick={() => { setSelectedRefundId(refund.id); setRefundAction('approve'); setShowRefundModal(true); }}>✓</button>
                                  <button className={styles.actionBtn} style={{ color: '#fa5252' }} onClick={() => { setSelectedRefundId(refund.id); setRefundAction('reject'); setShowRefundModal(true); }}>✕</button>
                                </>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className={styles.btnPrimary} onClick={() => setShowDetail(false)}>Đóng</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
           <div className={styles.modal} style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalContent}>
                 <h2 style={{ marginBottom: '1.5rem' }}>Cập nhật trạng thái thanh toán</h2>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>Trạng thái</label>
                    <select className={styles.selectInput} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                       {ALL_STATUSES.filter(s => s !== 'ALL').map(s => (
                         <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s] || s}</option>
                       ))}
                    </select>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button className={styles.btnGhost} onClick={() => setShowStatusModal(false)}>Hủy</button>
                    <button className={styles.btnPrimary} onClick={handleUpdateStatus} disabled={loading}>Cập nhật</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRefundModal(false)}>
           <div className={styles.modal} style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalContent}>
                 <h2 style={{ marginBottom: '1.5rem' }}>{refundAction === 'approve' ? 'Duyệt hoàn tiền' : 'Từ chối hoàn tiền'}</h2>
                 {refundAction === 'reject' && (
                   <div className={styles.formGroup}>
                      <label className={styles.label}>Lý do từ chối</label>
                      <textarea className={styles.textarea} value={refundReason} onChange={e => setRefundReason(e.target.value)} required placeholder="Lý do..." />
                   </div>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button className={styles.btnGhost} onClick={() => setShowRefundModal(false)}>Hủy</button>
                    <button className={styles.btnPrimary} onClick={handleRefundAction} disabled={loading}>{loading ? 'Đang xử lý...' : 'Xác nhận'}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
