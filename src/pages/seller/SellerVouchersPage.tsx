import { useState, useEffect } from 'react'
import { voucherApi, VOUCHER_TYPE_LABELS, VOUCHER_STATUS_LABELS } from '../../api/voucherApi'
import { useToast } from '../../hooks/useToast'
import type { VoucherDTO, CreateVoucherRequest } from '../../types'
import { Badge } from '../../components/admin/AdminUI'
import styles from '../admin/AdminProductsPage.module.css'

const PAGE_SIZE = 10
const ALL_STATUSES = ['ALL', 'ACTIVE', 'PENDING', 'DISABLED', 'EXPIRED', 'DEPLETED']

export function SellerVouchersPage() {
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [vouchers, setVouchers] = useState<VoucherDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherDTO | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const fetchVouchers = () => {
    setLoading(true)
    voucherApi.listMyVouchers({ 
      page: page - 1, 
      size: PAGE_SIZE, 
      status: statusFilter !== 'ALL' ? statusFilter : undefined 
    })
      .then(res => {
        if (res.data?.success && res.data.data) {
          setVouchers(res.data.data.content)
          setTotalElements(res.data.data.totalElements)
          setTotalPages(res.data.data.totalPages)
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách voucher' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVouchers()
  }, [page, statusFilter])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const rawData = Object.fromEntries(formData.entries())
    
    setLoading(true)
    try {
    const payload: CreateVoucherRequest = {
      code: rawData.code as string,
      name: rawData.name as string,
      description: rawData.description as string,
      type: rawData.type as any,
      scope: rawData.scope as any,
      discountValue: Number(rawData.discountValue),
      minOrderAmount: Number(rawData.minOrderAmount) || 0,
      maxDiscountAmount: rawData.maxDiscountAmount ? Number(rawData.maxDiscountAmount) : undefined,
      maxUsageTotal: Number(rawData.maxUsageTotal) || -1,
      maxUsagePerUser: Number(rawData.maxUsagePerUser) || 1,
      validFrom: rawData.validFrom ? rawData.validFrom as string : undefined,
      validTo: rawData.validTo ? rawData.validTo as string : undefined,
    }

      await voucherApi.createVoucher(payload)
      addToast({ type: 'success', message: 'Tạo voucher thành công' })
      setShowCreate(false)
      fetchVouchers()
    } catch {
      addToast({ type: 'error', message: 'Lỗi khi tạo' })
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Voucher Cửa hàng</h1>
          <p className={styles.pageSub}>Thu hút khách hàng bằng các chương trình ưu đãi</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Tạo Voucher</button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="Tìm mã voucher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Tất cả trạng thái</option>
          {ALL_STATUSES.filter(s => s !== 'ALL').map(s => (
            <option key={s} value={s}>{VOUCHER_STATUS_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Voucher</th>
              <th>Giảm giá</th>
              <th>Đơn tối thiểu</th>
              <th>Đã dùng</th>
              <th>Hạn dùng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && vouchers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : (vouchers || []).filter(v => v.code.toLowerCase().includes(search.toLowerCase())).map(v => (
              <tr key={v.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#6366f1' }}>{v.code}</div>
                  <div style={{ fontSize: '0.8rem', color: '#adb5bd' }}>{v.name}</div>
                </td>
                <td><Badge type="info">{v.type === 'PERCENTAGE' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}</Badge></td>
                <td>{formatCurrency(v.minOrderAmount)}</td>
                <td>{v.currentUsageCount} / {v.maxUsageTotal < 0 ? '∞' : v.maxUsageTotal}</td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(v.validTo).toLocaleDateString('vi-VN')}</td>
                <td>
                   <Badge type={v.status === 'ACTIVE' ? 'success' : 'neutral'}>{VOUCHER_STATUS_LABELS[v.status] || v.status}</Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setSelectedVoucher(v); setShowDetail(true); }} title="Chi tiết">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button className={styles.btnGhost} disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem' }}>Trang {page} / {totalPages}</span>
          <button className={styles.btnGhost} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
           <div className={styles.modal} style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalContent}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>Tạo Voucher Mới</h2>
                    <button className={styles.btnGhost} onClick={() => setShowCreate(false)}>✕</button>
                 </div>
                 <form onSubmit={handleCreate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div className={styles.formGroup}>
                          <label className={styles.label}>Mã Voucher</label>
                          <input name="code" className={styles.input} placeholder="SALE10" required />
                       </div>
                       <div className={styles.formGroup}>
                          <label className={styles.label}>Tên chương trình</label>
                          <input name="name" className={styles.input} placeholder="Giảm giá tri ân" required />
                       </div>
                       <div className={styles.formGroup}>
                          <label className={styles.label}>Loại</label>
                          <select name="type" className={styles.selectInput}>
                             <option value="PERCENTAGE">Phần trăm (%)</option>
                             <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                          </select>
                       </div>
                       <div className={styles.formGroup}>
                          <label className={styles.label}>Giá trị giảm</label>
                          <input name="discountValue" type="number" className={styles.input} required />
                       </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Phạm vi</label>
                           <select name="scope" className={styles.selectInput}>
                              <option value="ALL">Tất cả sản phẩm</option>
                              <option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</option>
                           </select>
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Đơn hàng tối thiểu (₫)</label>
                           <input name="minOrderAmount" type="number" className={styles.input} defaultValue={0} />
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Giảm tối đa (₫)</label>
                           <input name="maxDiscountAmount" type="number" className={styles.input} placeholder="Không giới hạn" />
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Tổng lượt dùng</label>
                           <input name="maxUsageTotal" type="number" className={styles.input} defaultValue={100} />
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Ngày bắt đầu</label>
                           <input name="validFrom" type="datetime-local" className={styles.input} required />
                        </div>
                        <div className={styles.formGroup}>
                           <label className={styles.label}>Ngày kết thúc</label>
                           <input name="validTo" type="datetime-local" className={styles.input} required />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                           <label className={styles.label}>Mô tả</label>
                           <textarea name="description" className={styles.input} style={{ height: 80 }} placeholder="Nhập mô tả voucher..." />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                       <button type="button" className={styles.btnGhost} onClick={() => setShowCreate(false)}>Hủy</button>
                       <button type="submit" className={styles.btnPrimary} disabled={loading}>Tạo ngay</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {showDetail && selectedVoucher && (
        <div className={styles.modalOverlay} onClick={() => setShowDetail(false)}>
          <div className={styles.modal} style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
             <div className={styles.modalContent}>
                <h2 style={{ marginBottom: '1.5rem' }}>{selectedVoucher.code}</h2>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: 12 }}>
                   <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#adb5bd' }}>Mô tả</div>
                      <div style={{ fontWeight: 500 }}>{selectedVoucher.description || 'Không có mô tả'}</div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                         <div style={{ fontSize: '0.8rem', color: '#adb5bd' }}>Bắt đầu</div>
                         <div style={{ fontWeight: 500 }}>{new Date(selectedVoucher.validFrom).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: '0.8rem', color: '#adb5bd' }}>Kết thúc</div>
                         <div style={{ fontWeight: 500 }}>{new Date(selectedVoucher.validTo).toLocaleDateString('vi-VN')}</div>
                      </div>
                   </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                   <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => setShowDetail(false)}>Đóng</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
