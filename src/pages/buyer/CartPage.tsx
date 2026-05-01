import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import styles from './CartPage.module.css'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

export function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Pre-select all items on first load
  useEffect(() => {
    if (cart?.items && !initialized) {
      setSelectedIds(cart.items.map(i => i.id))
      setInitialized(true)
    }
  }, [cart, initialized])

  const handleQtyChange = (productId: string, variantId: string | undefined, delta: number, current: number) => {
    const next = current + delta
    if (next < 1) return
    updateItem(productId, variantId, next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === cart?.items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(cart?.items.map(i => i.id) || [])
    }
  }

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) return
    
    for (const id of selectedIds) {
      const item = cart?.items.find(i => i.id === id)
      if (item) await removeItem(item.productId, item.variantId)
    }
    setSelectedIds([])
  }

  if (loading && !cart) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Đang tải giỏ hàng...</p>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0
  const selectedItems = cart?.items.filter(i => selectedIds.includes(i.id)) || []
  
  const selectedSubtotal = selectedItems.reduce((acc, i) => acc + i.lineTotal, 0)
  const selectedCount = selectedItems.length
  // Assume discount and shipping are proportional or fixed for simplicity here
  // In a real app, backend should calculate this for specific items
  const selectedTotal = selectedSubtotal // Simplified

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Giỏ hàng của tôi</h1>
          {!isEmpty && <span className={styles.count}>{cart.itemCount} sản phẩm tổng cộng</span>}
        </header>

        {isEmpty ? (
          <motion.div 
            className={styles.empty}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.emptyIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.12"/>
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
            <p className={styles.emptyText}>Có vẻ như bạn chưa chọn được món đồ nào ưng ý.</p>
            <Link to="/products" className={styles.btnPrimary}>Khám phá sản phẩm</Link>
          </motion.div>
        ) : (
          <div className={styles.content}>
            <div className={styles.mainCol}>
              {/* Select All Bar */}
              <div className={styles.selectionBar}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === cart?.items.length}
                    onChange={toggleSelectAll}
                  />
                  <span>Chọn tất cả ({cart?.items.length})</span>
                </label>
                {selectedIds.length > 0 && (
                  <button className={styles.bulkDelete} onClick={handleBulkDelete}>
                    Xóa ({selectedIds.length})
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className={styles.itemsList}>
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item) => (
                    <motion.div 
                      key={item.id} 
                      className={`${styles.itemCard} ${selectedIds.includes(item.id) ? styles.selected : ''}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <input 
                        type="checkbox" 
                        className={styles.itemCheckbox}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                      
                      <img src={item.productImageUrl || 'https://placehold.co/120'} alt={item.productName || 'Sản phẩm'} className={styles.itemImg} />
                      <div className={styles.itemInfo}>
                        <Link to={`/products/${item.productId}`} className={styles.itemName}>{item.productName || 'Đang tải...'}</Link>
                        {item.variantTitle && <span className={styles.itemVariant}>{item.variantTitle}</span>}
                        <div className={styles.itemPrice}>{fmt(item.unitPrice)}</div>
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.qtyControl}>
                          <button onClick={() => handleQtyChange(item.productId, item.variantId, -1, item.quantity)} disabled={item.quantity <= 1}>−</button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item.productId, item.variantId, 1, item.quantity)}>+</button>
                        </div>
                        <div className={styles.itemTotal}>{fmt(item.lineTotal)}</div>
                        <button className={styles.btnRemove} onClick={() => removeItem(item.productId, item.variantId)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Summary Sidebar */}
            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
                
                <div className={styles.summaryRow}>
                  <span>Tạm tính ({selectedCount} sản phẩm)</span>
                  <span>{fmt(selectedSubtotal)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Phí vận chuyển</span>
                  <span className={styles.freeShip}>Miễn phí</span>
                </div>

                {cart.discountAmount > 0 && selectedCount === cart.items.length && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>Giảm giá</span>
                    <span>-{fmt(cart.discountAmount)}</span>
                  </div>
                )}

                <hr className={styles.divider} />

                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Tổng cộng</span>
                  <span>{fmt(selectedTotal)}</span>
                </div>

                <button 
                  className={styles.btnCheckout}
                  disabled={selectedCount === 0}
                  onClick={() => navigate('/checkout', { state: { selectedItemIds: selectedIds } })}
                >
                  Mua hàng ({selectedCount})
                </button>
                
                <p className={styles.guarantee}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Cam kết chính hãng & Bảo mật thanh toán
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
