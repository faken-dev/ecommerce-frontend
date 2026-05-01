import { useState, useEffect } from 'react'
import { inventoryApi } from '../../api/inventoryApi'
import { catalogApi } from '../../api/catalogApi'
import { useToast } from '../../hooks/useToast'
import { Icon } from '../../components/common/Icon'
import { Badge } from '../../components/admin/AdminUI'
import styles from '../admin/AdminInventoryPage.module.css'

interface InventoryWithProduct {
  id: string
  productId: string
  variantId: string
  slotId?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  name: string
  sku: string
  imageUrl: string
  category?: string
}

export function SellerInventoryPage() {
  const { add: addToast } = useToast()
  const [items, setItems] = useState<InventoryWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  
  const [showSetLocation, setShowSetLocation] = useState<string | null>(null) // productId
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [structure, setStructure] = useState<any[]>([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, prodRes] = await Promise.all([
        inventoryApi.listSellerInventory({ page: page - 1, size: 20 }),
        catalogApi.getMyProducts(page - 1, 20)
      ])

      if (invRes.data?.success && prodRes.data?.success) {
        const products = prodRes.data.data
        const invData = invRes.data.data as any
        const invItems = Array.isArray(invData) ? invData : invData.content || []

        if (invRes.data.page) {
          setTotalPages(invRes.data.page.totalPages)
        }

        const enriched = invItems.map((inv: any) => {
          const p = products.find((x: any) => x.id === inv.productId)
          return {
            ...inv,
            name: p?.name || 'Sản phẩm đã xóa',
            sku: p?.sku || 'N/A',
            imageUrl: p?.imageUrl || '',
            category: p?.categoryName
          }
        })
        setItems(enriched)
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể tải dữ liệu tồn kho' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdjust = async (productId: string, variantId: string, change: number) => {
    try {
      const res = await inventoryApi.adjustStock(
        productId,
        change,
        'MANUAL_ADJUST',
        'Điều chỉnh nhanh từ giao diện Seller',
        variantId
      )
      if (res.data?.success) {
        setItems(prev => prev.map(item => 
          item.productId === productId ? { ...item, quantity: item.quantity + change, availableQuantity: item.availableQuantity + change } : item
        ))
        addToast({ type: 'success', message: 'Cập nhật thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể cập nhật số lượng' })
    }
  }

  const fetchLogs = async (productId: string) => {
    setLoadingLogs(true)
    try {
      const res = await inventoryApi.getLogs(productId)
      if (res.data?.success) setLogs(res.data.data)
    } finally {
      setLoadingLogs(false)
    }
  }

  const fetchWarehouses = async () => {
    const res = await inventoryApi.getWarehouses()
    if (res.data?.success) setWarehouses(res.data.data)
  }

  const fetchStructure = async (warehouseId: string) => {
    const res = await inventoryApi.getStructure(warehouseId)
    if (res.data?.success) setStructure(res.data.data)
  }

  const handleSetLocation = async (productId: string, slotId: string) => {
    try {
      const res = await inventoryApi.updateProductLocation(productId, slotId)
      if (res.data?.success) {
        setItems(prev => prev.map(item => item.productId === productId ? { ...item, slotId } : item))
        setShowSetLocation(null)
        addToast({ type: 'success', message: 'Cập nhật vị trí thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể cập nhật vị trí' })
    }
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Vận hành Tồn kho</h1>
          <p className={styles.pageSub}>Quản lý nhập xuất và vị trí lưu trữ hàng hóa của bạn</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchInputWrapper}>
          <Icon.Search className={styles.searchIcon} size={20} />
          <input 
            className={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Vị trí (Location)</th>
                <th>Tồn kho</th>
                <th>Khả dụng</th>
                <th>Điều chỉnh nhanh</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.loading}>Đang tải dữ liệu...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6} className={styles.loading}>Không tìm thấy sản phẩm nào.</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={item.imageUrl || 'https://placehold.co/80'} className={styles.img} alt="" />
                      <div>
                        <div className={styles.productName}>{item.name}</div>
                        <div className={styles.skuCode}>{item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.slotId ? (
                      <div className={styles.locationBadge}>
                        <Icon.MapPin size={14} />
                        <span>Đã gán vị trí</span>
                      </div>
                    ) : (
                      <button 
                        className={styles.adjustBtn} 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setShowSetLocation(item.productId)
                          fetchWarehouses()
                        }}
                      >
                        + Gán vị trí
                      </button>
                    )}
                  </td>
                  <td><span className={styles.stockVal}>{item.quantity}</span></td>
                  <td>
                    <Badge type={item.availableQuantity > 0 ? 'success' : 'error'}>
                      {item.availableQuantity} sẵn sàng
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.adjustGroup}>
                      <button className={styles.actionBtn} onClick={() => handleAdjust(item.productId, item.variantId, -1)}>-</button>
                      <button className={styles.actionBtn} onClick={() => handleAdjust(item.productId, item.variantId, 1)}>+</button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button 
                        className={styles.actionBtn} 
                        title="Thay đổi vị trí"
                        onClick={() => {
                          setShowSetLocation(item.productId)
                          fetchWarehouses()
                        }}
                      >
                        <Icon.MapPin size={16} />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        title="Lịch sử biến động"
                        onClick={() => {
                          setShowHistory(item.productId)
                          fetchLogs(item.productId)
                        }}
                      >
                        <Icon.FileText size={16} />
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button className={styles.btnGhost} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
               <Icon.ChevronLeft size={16} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
               Trang {page} / {totalPages}
            </span>
            <button className={styles.btnGhost} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
               <Icon.ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 700, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Lịch sử Biến động Kho</h2>
              <button className={styles.actionBtn} onClick={() => setShowHistory(null)}><Icon.X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingLogs ? <div className={styles.loading}>Đang tải nhật ký...</div> : logs.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có bản ghi nào.</p> : (
                <table className={styles.table} style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Thao tác</th>
                      <th>Thay đổi</th>
                      <th>Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                        <td><Badge type="info">{log.action}</Badge></td>
                        <td style={{ fontWeight: 700, color: log.changeAmount > 0 ? '#4ade80' : '#f87171' }}>
                          {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                        </td>
                        <td>{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showSetLocation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 600 }}>
            <h2 style={{ marginBottom: 24 }}>Gán vị trí lưu trữ</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label className={styles.label}>Chọn kho hàng</label>
              <select 
                className={styles.input}
                value={selectedWarehouse}
                onChange={e => {
                  setSelectedWarehouse(e.target.value)
                  fetchStructure(e.target.value)
                }}
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            {selectedWarehouse && (
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 24 }}>
                <label className={styles.label}>Chọn vị trí (Slot)</label>
                {structure.length === 0 ? <p className={styles.pageSub}>Kho này chưa có khu vực lưu trữ.</p> : structure.map(zone => (
                  <div key={zone.id} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>{zone.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                      {zone.slots?.map((slot: any) => (
                        <button 
                          key={slot.id}
                          style={{ 
                            padding: '8px 4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                            borderRadius: 8, fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-primary)'
                          }}
                          onClick={() => handleSetLocation(showSetLocation, slot.id)}
                        >
                          {slot.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className={styles.adjustBtn} onClick={() => setShowSetLocation(null)}>Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
