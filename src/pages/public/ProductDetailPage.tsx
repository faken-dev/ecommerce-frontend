import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { catalogApi, type ProductDetailDTO } from '../../api/catalogApi'
import { inventoryApi, type InventoryItemDTO } from '../../api/inventoryApi'
import { CartFly, CartIcon, useCartFly } from '../../components/ecommerce/CartFly'
import { Product3DViewer } from '../../components/three/Product3DViewer'
import styles from './ProductDetailPage.module.css'
import { ReviewSection } from '../../components/ecommerce/ReviewSection'
import { VoucherSection } from '../../components/ecommerce/VoucherSection'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ProductDetailDTO | null>(null)
  const [inventory, setInventory] = useState<InventoryItemDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D')
  const { trigger, cartCount, handleAddToCart, handleComplete } = useCartFly()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const { add: addToast } = useToast()

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      return addToast({ type: 'warning', message: 'Vui lòng đăng nhập để lưu sản phẩm' })
    }
    if (!product) return

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id)
        addToast({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích' })
      } else {
        await addToWishlist(product.id)
        addToast({ type: 'success', message: 'Đã thêm vào danh sách yêu thích' })
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể thực hiện thao tác' })
    }
  }

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    
    catalogApi.getPublic(slug)
      .then(res => {
        if (res.data?.success) {
          const prod = res.data.data
          setProduct(prod)
          if (prod.threeDModelUrl) {
            setViewMode('3D')
          }
          // Fetch inventory after we have the real product ID
          return inventoryApi.getByProduct(prod.id)
        }
        return null
      })
      .then(invRes => {
        if (invRes?.data?.success) {
          setInventory(invRes.data.data)
        }
      })
      .catch(err => console.error('Failed to fetch product data', err))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Không tìm thấy sản phẩm</h2>
          <Link to="/products" className={styles.backBtn} style={{ justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const handleAdd = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    handleAddToCart(product.id, rect, product.price)
  }

  const availableStock = inventory?.availableQuantity ?? 0

  return (
    <div className={styles.page}>

      <Link to="/products" className={styles.backBtn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Quay lại cửa hàng
      </Link>

      <div className={styles.layout}>
        <div className={styles.visuals}>
          <div className={styles.viewerContainer}>
            <AnimatePresence mode="wait">
              {viewMode === '3D' ? (
                <motion.div 
                  key="3d"
                  className={styles.threeDWrap}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Product3DViewer modelUrl={product.threeDModelUrl} />
                </motion.div>
              ) : (
                <motion.div 
                  key="2d"
                  className={styles.imageWrap}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <img 
                    src={selectedImage || product.imageUrl || 'https://placehold.co/800'} 
                    alt={product.name} 
                    className={styles.image} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {product.threeDModelUrl && (
              <div className={styles.viewToggle}>
                <button 
                  className={viewMode === '2D' ? styles.toggleActive : ''} 
                  onClick={() => setViewMode('2D')}
                >
                  2D IMAGE
                </button>
                <button 
                  className={viewMode === '3D' ? styles.toggleActive : ''} 
                  onClick={() => setViewMode('3D')}
                >
                  3D MODEL
                </button>
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className={styles.gallery}>
              {product.images.map((img, idx) => (
                <button 
                  key={img.id} 
                  className={`${styles.thumb} ${ (selectedImage === img.url || (!selectedImage && idx === 0)) ? styles.thumbActive : ''}`}
                  onClick={() => {
                    setSelectedImage(img.url)
                    setViewMode('2D')
                  }}
                >
                  <img src={img.url} alt={`Preview ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div 
          className={styles.info}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.breadcrumb}>
            <Link to="/products">CỬA HÀNG</Link>
            <span className={styles.separator}>/</span>
            <span>{product.categoryName?.toUpperCase() || 'PHÂN LOẠI'}</span>
          </div>

          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.meta}>
            <div className={styles.priceGroup}>
              <span className={styles.currentPrice}>{fmt(product.price)}</span>
              {product.compareAtPrice && (
                <span className={styles.oldPrice}>{fmt(product.compareAtPrice)}</span>
              )}
            </div>
            
            <div className={styles.stockStatus}>
              <span className={`${styles.stockDot} ${availableStock < 5 ? styles.stockDotLow : ''}`} />
              {availableStock > 0 ? `SẴN HÀNG: ${availableStock}` : 'LIÊN HỆ ĐẶT HÀNG'}
            </div>
          </div>

          <div className={styles.specs}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>MÃ SẢN PHẨM:</span>
              <span className={styles.specValue}>{product.sku || 'N/A'}</span>
            </div>
            {product.weightKg && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>TRỌNG LƯỢNG:</span>
                <span className={styles.specValue}>{product.weightKg} {product.weightUnit || 'KG'}</span>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>TAGS:</span>
                <span className={styles.specValue}>{product.tags.join(', ')}</span>
              </div>
            )}
          </div>

          <VoucherSection sellerId={product.sellerId} productId={product.id} />

          <div className={styles.actions}>
            <button 
              className={styles.addBtn} 
              onClick={handleAdd}
              disabled={availableStock === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {availableStock > 0 ? 'XÁC NHẬN MUA HÀNG' : 'LIÊN HỆ ĐẶT HÀNG'}
            </button>

            <button 
              className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.wishlistBtnActive : ''}`}
              onClick={toggleWishlist}
              title="Yêu thích"
            >
              <Heart 
                size={24} 
                fill={isInWishlist(product.id) ? "currentColor" : "none"} 
                color={isInWishlist(product.id) ? "var(--accent-primary)" : "currentColor"}
              />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.section 
        className={styles.detailsSection}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className={styles.sectionTabs}>
          <button className={styles.tabActive}>MÔ TẢ CHI TIẾT</button>
          <button className={styles.tab}>THÔNG SỐ KỸ THUẬT</button>
          <button className={styles.tab}>CHÍNH SÁCH VẬN CHUYỂN</button>
        </div>
        <div className={styles.longDesc} dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }} />
      </motion.section>

      {product.id && <ReviewSection productId={product.id} />}

      <CartFly trigger={trigger} onComplete={handleComplete} />
    </div>
  )
}
