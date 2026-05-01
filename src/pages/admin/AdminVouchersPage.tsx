import { useState, useEffect } from 'react'
import { voucherApi, VOUCHER_TYPE_LABELS, VOUCHER_STATUS_LABELS } from '../../api/voucherApi'
import { useToast } from '../../hooks/useToast'
import type { VoucherDTO } from '../../types'
import { Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css'

const PAGE_SIZE = 10
const ALL_STATUSES = ['ALL', 'ACTIVE', 'PENDING', 'DISABLED', 'EXPIRED', 'DEPLETED']

export function AdminVouchersPage() {
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [vouchers, setVouchers] = useState<VoucherDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('PERCENTAGE')
  const [createScope, setCreateScope] = useState('ALL')
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherDTO | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchVouchers = () => {
    setLoading(true)
    voucherApi.listVouchers({ 
      page: page - 1, 
      size: PAGE_SIZE, 
      status: statusFilter !== 'ALL' ? statusFilter : undefined 
    })
      .then(res => {
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          // Handle both cases: data is an array or data is an object with content
          setVouchers(Array.isArray(data) ? data : (data as any).content || []);
          
          if (res.data.page) {
            setTotalElements(res.data.page.totalElements)
            setTotalPages(res.data.page.totalPages)
          }
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách voucher' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVouchers()
    // Fetch products and categories for scope selection
    import('../../api/catalogApi').then(({ catalogApi }) => {
      catalogApi.listAllAdmin(0, 100).then(res => {
        if (res.data?.success) {
          const data = res.data.data;
          setAllProducts(Array.isArray(data) ? data : (data as any).content || []);
        }
      })
      catalogApi.getCategoryTree().then(res => {
        if (res.data?.success) setAllCategories(res.data.data)
      })
    })
  }, [page, statusFilter])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const formatDiscount = (voucher: VoucherDTO) => {
    if (voucher.type === 'PERCENTAGE') return `${voucher.discountValue}%`
    return formatCurrency(voucher.discountValue)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa voucher này?')) return
    try {
      const res = await voucherApi.deleteVoucher(id)
      if (res.data?.success) {
        addToast({ type: 'success', message: 'Đã xóa voucher' })
        fetchVouchers()
      }
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }

  const handleActivate = async (id: string) => {
    try {
      const res = await voucherApi.activateVoucher(id)
      if (res.data?.success) {
        addToast({ type: 'success', message: 'Đã kích hoạt voucher' })
        fetchVouchers()
      }
    } catch { addToast({ type: 'error', message: 'Kích hoạt thất bại' }) }
  }

  const handleDisable = async (id: string) => {
    try {
      const res = await voucherApi.disableVoucher(id)
      if (res.data?.success) {
        addToast({ type: 'success', message: 'Đã vô hiệu hóa voucher' })
        fetchVouchers()
      }
    } catch { addToast({ type: 'error', message: 'Vô hiệu hóa thất bại' }) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    
    let discountValue = Number(payload.discountValue);
    if (payload.type === 'PERCENTAGE' && discountValue > 100) {
      discountValue = 100;
    }

    setLoading(true)
    try {
      const res = await voucherApi.createVoucher({
        ...payload,
        discountValue,
        minOrderAmount: Number(payload.minOrderAmount) || 0,
        maxDiscountAmount: payload.maxDiscountAmount ? Number(payload.maxDiscountAmount) : null,
        maxUsageTotal: Number(payload.maxUsageTotal) || -1,
        maxUsagePerUser: Number(payload.maxUsagePerUser) || 1,
        validFrom: payload.validFrom ? new Date(payload.validFrom as string).toISOString() : null,
        validTo: payload.validTo ? new Date(payload.validTo as string).toISOString() : null,
        applicableProductIds: payload.scope === 'SPECIFIC_PRODUCTS' ? selectedIds : [],
        applicableCategoryIds: payload.scope === 'SPECIFIC_CATEGORIES' ? selectedIds : [],
        requiresCollection: payload.requiresCollection === 'on',
      })
      if (res.data?.success) {
        addToast({ type: 'success', message: 'Tạo voucher thành công' })
        fetchVouchers()
        setShowCreate(false)
      }
    } catch (err: any) { 
      addToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi tạo' }) 
    }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Voucher</h1>
          <p className={styles.pageSub}>Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Thêm Voucher</button>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Tìm mã hoặc tên voucher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
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
              <th>Loại / Ưu đãi</th>
              <th>Đơn tối thiểu</th>
              <th>Đã dùng</th>
              <th>Hiệu lực</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : vouchers?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Không có dữ liệu.</td></tr>
            ) : vouchers?.filter(v => v.code.toLowerCase().includes(search.toLowerCase())).map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>{v.code}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.name}</div>
                </td>
                <td>
                  <Badge type="info">{VOUCHER_TYPE_LABELS[v.type]}</Badge>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{formatDiscount(v)}</div>
                </td>
                <td>{formatCurrency(v.minOrderAmount)}</td>
                <td>
                   <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.currentUsageCount}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / {v.maxUsageTotal < 0 ? '∞' : v.maxUsageTotal}</span>
                   </div>
                   {v.maxUsageTotal > 0 && (
                     <div style={{ width: 80, height: 4, background: 'var(--border-muted)', borderRadius: 2, marginTop: 4 }}>
                       <div style={{ 
                         width: `${(v.currentUsageCount / v.maxUsageTotal) * 100}%`, 
                         height: '100%', background: 'var(--accent-primary)', borderRadius: 2 
                       }} />
                     </div>
                   )}
                </td>
                 <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                   {v.validFrom ? new Date(v.validFrom).toLocaleDateString('vi-VN') : '—'} 
                   <br/>
                   <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>đến {v.validTo ? new Date(v.validTo).toLocaleDateString('vi-VN') : '—'}</span>
                </td>
                <td>
                  <Badge type={v.status === 'ACTIVE' ? 'success' : v.status === 'EXPIRED' ? 'error' : 'neutral'}>
                    {VOUCHER_STATUS_LABELS[v.status] || v.status}
                  </Badge>
                  {v.requiresCollection && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', marginTop: 4, fontWeight: 700 }}>
                       BẮT BUỘC LƯU
                    </div>
                  )}
                </td>
                 <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setSelectedVoucher(v); setShowDetail(true); }} title="Chi tiết">
                      <Icon.Eye size={16} />
                    </button>
                    {v.status === 'ACTIVE' ? (
                      <button className={styles.actionBtn} onClick={() => handleDisable(v.id)} style={{ color: '#ff9800' }} title="Vô hiệu hóa">
                        <Icon.X size={16} />
                      </button>
                    ) : (v.status === 'PENDING' || v.status === 'DISABLED') && (
                      <button className={styles.actionBtn} onClick={() => handleActivate(v.id)} style={{ color: '#4caf50' }} title="Kích hoạt">
                        <Icon.Check size={16} />
                      </button>
                    )}
                    <button className={styles.actionBtn} onClick={() => handleDelete(v.id)} style={{ color: '#ff4d4d' }} title="Xóa">
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
                <h2 style={{ margin: 0 }}>Thêm Voucher Mới</h2>
                <button className={styles.btnGhost} onClick={() => setShowCreate(false)}>✕</button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mã Voucher</label>
                    <input name="code" className={styles.input} placeholder="VD: SUMMER20" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên hiển thị</label>
                    <input name="name" className={styles.input} placeholder="Giảm giá mùa hè" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Loại hình</label>
                    <select name="type" className={styles.selectInput} value={createType} onChange={(e) => setCreateType(e.target.value)}>
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                      <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phạm vi áp dụng</label>
                    <select name="scope" className={styles.selectInput} value={createScope} onChange={(e) => { setCreateScope(e.target.value); setSelectedIds([]); }}>
                      <option value="ALL">Tất cả sản phẩm</option>
                      <option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</option>
                      <option value="SPECIFIC_CATEGORIES">Danh mục cụ thể</option>
                    </select>
                  </div>
                  {createScope !== 'ALL' && (
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>
                         {createScope === 'SPECIFIC_PRODUCTS' ? 'Chọn Sản phẩm' : 'Chọn Danh mục'}
                      </label>
                      <div className={styles.multiSelectContainer}>
                         <div className={styles.multiSelectChips}>
                            {selectedIds.map(id => {
                               const item = createScope === 'SPECIFIC_PRODUCTS' 
                                 ? allProducts.find(p => p.id === id)
                                 : allCategories.find(c => c.id === id);
                               return (
                                 <div key={id} className={styles.chip}>
                                    {item?.name || id}
                                    <span onClick={() => setSelectedIds(prev => prev.filter(i => i !== id))}>✕</span>
                                 </div>
                               )
                            })}
                         </div>
                         <select 
                           className={styles.selectInput} 
                           onChange={(e) => {
                             const id = e.target.value;
                             if (id && !selectedIds.includes(id)) {
                               setSelectedIds(prev => [...prev, id]);
                             }
                             e.target.value = '';
                           }}
                         >
                            <option value="">-- Chọn {createScope === 'SPECIFIC_PRODUCTS' ? 'sản phẩm' : 'danh mục'} --</option>
                            {(createScope === 'SPECIFIC_PRODUCTS' ? allProducts : allCategories).map(item => (
                              <option key={item.id} value={item.id} disabled={selectedIds.includes(item.id)}>
                                {item.name}
                              </option>
                            ))}
                         </select>
                      </div>
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {createType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (₫)'}
                    </label>
                    <input 
                      name="discountValue" 
                      type="number" 
                      className={styles.input} 
                      required 
                      min={0.01}
                      max={createType === 'PERCENTAGE' ? 100 : 1000000000}
                      step={createType === 'PERCENTAGE' ? 0.01 : 1000}
                      placeholder={createType === 'PERCENTAGE' ? '0.01 - 100' : 'Ví dụ: 50000'}
                      onChange={(e) => {
                        if (createType === 'PERCENTAGE' && Number(e.target.value) > 100) {
                          e.target.value = '100';
                        }
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Đơn hàng tối thiểu (₫)</label>
                    <input name="minOrderAmount" type="number" className={styles.input} defaultValue={0} min={0} step={1000} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Giảm tối đa (₫)</label>
                    <input name="maxDiscountAmount" type="number" className={styles.input} placeholder="Không giới hạn" min={0} step={1000} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tổng lượt dùng</label>
                    <input name="maxUsageTotal" type="number" className={styles.input} defaultValue={100} min={1} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Lượt dùng / Người</label>
                    <input name="maxUsagePerUser" type="number" className={styles.input} defaultValue={1} min={1} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày bắt đầu</label>
                    <input name="validFrom" type="datetime-local" className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày kết thúc</label>
                    <input name="validTo" type="datetime-local" className={styles.input} required />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input name="requiresCollection" type="checkbox" id="requiresCollection" />
                    <label htmlFor="requiresCollection" style={{ fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                      Bắt buộc người dùng phải "Lưu" voucher trước khi sử dụng
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowCreate(false)}>Hủy</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>Tạo Voucher</button>
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
                 <h2 style={{ marginBottom: '1.5rem' }}>Chi tiết Voucher: {selectedVoucher.code}</h2>
                 <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mô tả</div>
                       <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedVoucher.description || 'Không có mô tả'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đã dùng</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedVoucher.currentUsageCount} lượt</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Còn lại</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                             {selectedVoucher.maxUsageTotal < 0 ? 'Vô hạn' : `${Math.max(0, selectedVoucher.maxUsageTotal - selectedVoucher.currentUsageCount)} lượt`}
                          </div>
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
