import { useEffect, useState } from 'react'
import { catalogApi, type ProductSummaryDTO, type CategoryDTO } from '../../api/catalogApi'
import { useToast } from '../../hooks/useToast'
import { Badge, SeoPreview, ImageUpload, Card } from '../../components/admin/AdminUI'
import { CategorySelect } from '../../components/admin/CategorySelect'
import { Icon } from '../../components/common/Icon'
import styles from '../admin/AdminProductsPage.module.css' 

export function SellerProductsPage() {
  const { add: addToast } = useToast()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [products, setProducts] = useState<ProductSummaryDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)
  const [images, setImages] = useState<any[]>([])

  // SEO Preview states
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const fetchProducts = () => {
    setLoading(true)
    catalogApi.getMyProducts(page - 1, 10)
      .then(res => {
        if (res.data?.success && res.data.data) {
          setProducts(res.data.data)
          if (res.data.page) {
            setTotalPages(res.data.page.totalPages)
            setTotalElements(res.data.page.totalElements)
          }
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách sản phẩm' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
    catalogApi.getCategoryTree().then(res => {
      if (res.data?.success) setCategories(res.data.data)
    })
  }, [page])

  useEffect(() => {
    if (editProduct) {
        setMetaTitle(editProduct.metaTitle || '')
        setMetaDescription(editProduct.metaDescription || '')
        setSlug(editProduct.slug || '')
    } else {
        setMetaTitle(''); setMetaDescription(''); setSlug('')
        setSelectedCategoryId('')
        setImages([])
    }
  }, [editProduct, showModal])

  useEffect(() => {
    if (editProduct) {
        setSelectedCategoryId(editProduct.categoryId || '')
    }
  }, [editProduct])

  useEffect(() => {
    if (editProduct && editProduct.images) {
        setImages(editProduct.images)
    }
  }, [editProduct])

  const handleActivate = async (productId: string) => {
    try {
      await catalogApi.activate(productId)
      addToast({ type: 'success', message: 'Kích hoạt sản phẩm thành công' })
      fetchProducts()
    } catch { addToast({ type: 'error', message: 'Kích hoạt thất bại' }) }
  }

  const flattenCategories = (nodes: CategoryDTO[], depth = 0): { id: string, name: string }[] => {
    let result: { id: string, name: string }[] = []
    nodes.forEach(node => {
        result.push({ id: node.id, name: `${'—'.repeat(depth)} ${node.name}` })
        if (node.children && node.children.length > 0) {
            result = [...result, ...flattenCategories(node.children, depth + 1)]
        }
    })
    return result
  }

  const flattenedCategories = flattenCategories(categories)

  const handleDelete = async (productId: string) => {
    if (!confirm('Xóa sản phẩm này?')) return
    try {
      await catalogApi.delete(productId)
      addToast({ type: 'success', message: 'Đã xóa sản phẩm' })
      fetchProducts()
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const rawData = Object.fromEntries(formData.entries())

    const payload = {
        ...rawData,
        price: Number(rawData.price),
        compareAtPrice: rawData.compareAtPrice ? Number(rawData.compareAtPrice) : null,
        costPerItem: rawData.costPerItem ? Number(rawData.costPerItem) : null,
        stockQuantity: Number(rawData.stockQuantity),
        lowStockThreshold: Number(rawData.lowStockThreshold || 10),
        weightKg: rawData.weightKg ? Number(rawData.weightKg) : null,
        metaTitle,
        metaDescription,
        slug,
        categoryId: selectedCategoryId || null,
        images: images.filter(img => img.url),
        tags: (rawData.tags as string)?.split(',').map(t => t.trim()).filter(t => t) || []
    }

    try {
        if (editProduct) {
            await catalogApi.update(editProduct.id, payload)
            addToast({ type: 'success', message: 'Cập nhật thành công' })
        } else {
            await catalogApi.create(payload)
            addToast({ type: 'success', message: 'Đã tạo sản phẩm' })
        }
        setShowModal(false)
        fetchProducts()
    } catch (err: any) {
        addToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lưu' })
    } finally { setLoading(false) }
  }

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sản phẩm của tôi</h1>
          <p className={styles.pageSub}>Quản lý danh sách hàng hóa đang kinh doanh</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setEditProduct(null); setShowModal(true); }}>+ Đăng sản phẩm mới</button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="Tìm sản phẩm theo tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Chưa có sản phẩm nào.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productCell}>
                    <img src={p.imageUrl || 'https://placehold.co/80'} className={styles.tableImg} alt="" />
                    <div className={styles.productName}>{p.name}</div>
                  </div>
                </td>
                <td><Badge type="info">{p.categoryName || 'Mặc định'}</Badge></td>
                <td style={{ fontWeight: 600, color: '#6366f1' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: p.stockQuantity === 0 ? '#fa5252' : '#495057' }}>{p.stockQuantity}</span>
                </td>
                <td>
                  <Badge type={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {p.status === 'ACTIVE' ? 'Đang bán' : p.status}
                  </Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setEditProduct(p); setShowModal(true); }} title="Sửa">
                      <Icon.Edit size={16} />
                    </button>
                    {p.status === 'DRAFT' && (
                      <button className={styles.actionBtn} onClick={() => handleActivate(p.id)} title="Hiện">
                        <Icon.Zap size={16} color="var(--status-success)" />
                      </button>
                    )}
                    <button className={styles.actionBtn} onClick={() => handleDelete(p.id)} title="Xóa">
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

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
             <div className={styles.modalContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>{editProduct ? 'Sửa sản phẩm' : 'Đăng sản phẩm mới'}</h2>
                    <button className={styles.btnGhost} onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSave}>
                   <div className={styles.formLayout}>
                      <div className={styles.leftCol}>
                        <Card title="Thông tin cơ bản">
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Tên sản phẩm</label>
                               <input name="name" className={styles.input} defaultValue={editProduct?.name} required placeholder="VD: Giày Thể Thao Cao Cấp" />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Mô tả</label>
                               <textarea name="description" className={styles.textarea} defaultValue={editProduct?.description} style={{ minHeight: 150 }} placeholder="Mô tả đặc điểm nổi bật..." />
                            </div>
                         </Card>

                         <Card title="Hình ảnh sản phẩm" description="Tải lên hình ảnh chất lượng cao để tăng tỷ lệ chuyển đổi.">
                            <div className={styles.imageGrid}>
                                {images.map((img, idx) => (
                                     <div key={idx} className={styles.imageSlot}>
                                        <ImageUpload 
                                            value={img.url}
                                            onChange={(url) => {
                                                const newImages = [...images]
                                                if (url === '') {
                                                    newImages.splice(idx, 1)
                                                } else {
                                                    newImages[idx].url = url
                                                }
                                                setImages(newImages)
                                            }}
                                            folder="products"
                                        />
                                        {img.url && <div className={styles.imageBadge}>Ảnh {idx + 1}</div>}
                                     </div>
                                 ))}
                                 {images.length < 10 && (
                                    <button 
                                        type="button"
                                        className={styles.addSlotBtn} 
                                        onClick={() => setImages([...images, { 
                                            url: '', 
                                            altText: '', 
                                            sortOrder: images.length, 
                                            primary: images.length === 0 
                                        }])}
                                    >
                                        <div className={styles.addSlotContent}>
                                          <Icon.Plus size={18} />
                                          <span className={styles.addSlotLabel}>Thêm ảnh</span>
                                        </div>
                                    </button>
                                 )}
                            </div>
                         </Card>

                         <Card title="Cấu hình SEO" description="Tối ưu hóa hiển thị trên các công cụ tìm kiếm.">
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Slug (URL)</label>
                               <input value={slug} onChange={e => setSlug(e.target.value)} className={styles.input} required placeholder="ao-thun-cotton" />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Tiêu đề SEO</label>
                               <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className={styles.input} placeholder="Tiêu đề hiển thị trên Google" />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Mô tả SEO</label>
                               <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className={styles.textarea} style={{ minHeight: 80 }} placeholder="Mô tả thu hút người dùng..." />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label className={styles.label}>Xem trước kết quả tìm kiếm:</label>
                                <SeoPreview title={metaTitle} description={metaDescription} slug={slug} />
                            </div>
                         </Card>
                      </div>

                      <div className={styles.rightCol}>
                         <Card title="Trạng thái & Hiển thị">
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Hiển thị</label>
                                <select name="visibility" className={styles.selectInput} defaultValue={editProduct?.visibility || 'PUBLIC'}>
                                    <option value="PUBLIC">Công khai trên Web</option>
                                    <option value="HIDDEN">Ẩn khỏi cửa hàng</option>
                                </select>
                            </div>
                         </Card>

                         <Card title="Phân loại">
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Danh mục</label>
                               <CategorySelect 
                                  categories={categories}
                                  value={selectedCategoryId}
                                  onChange={setSelectedCategoryId}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mã sản phẩm (SKU)</label>
                                <input name="sku" className={styles.input} defaultValue={editProduct?.sku} placeholder="VD: AO-THUN-001" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mã vạch (Barcode)</label>
                                <input name="barcode" className={styles.input} defaultValue={editProduct?.barcode} placeholder="UPC, EAN..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tags (Cùng dấu phẩy)</label>
                                <input name="tags" className={styles.input} defaultValue={editProduct?.tags?.join(', ')} placeholder="Hot, New, Summer..." />
                            </div>
                         </Card>

                         <Card title="Giá bán & Kho">
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Giá hiện tại (₫)</label>
                               <input name="price" type="number" className={styles.input} defaultValue={editProduct?.price} required />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Giá gốc (₫)</label>
                               <input name="compareAtPrice" type="number" className={styles.input} defaultValue={editProduct?.compareAtPrice} />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Tồn kho</label>
                               <input name="stockQuantity" type="number" className={styles.input} defaultValue={editProduct?.stockQuantity} required />
                            </div>
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Ngưỡng tồn thấp</label>
                               <input name="lowStockThreshold" type="number" className={styles.input} defaultValue={editProduct?.lowStockThreshold || 10} />
                            </div>
                         </Card>

                         <Card title="Vận chuyển">
                            <div className={styles.formGroup}>
                               <label className={styles.label}>Cân nặng (kg)</label>
                               <input name="weightKg" type="number" step="0.01" className={styles.input} defaultValue={editProduct?.weightKg} placeholder="0.5" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Đơn vị cân nặng</label>
                                <select name="weightUnit" className={styles.selectInput} defaultValue={editProduct?.weightUnit || 'kg'}>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="g">Gram (g)</option>
                                </select>
                            </div>
                         </Card>
                      </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                      <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Hủy</button>
                      <button type="submit" className={styles.btnPrimary} disabled={loading}>
                        {loading ? 'Đang lưu...' : (editProduct ? 'Lưu thay đổi' : 'Đăng sản phẩm')}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}