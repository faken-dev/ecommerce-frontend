import { useState, useEffect } from 'react'
import { catalogApi, type ProductSummaryDTO, type CategoryDTO } from '../../api/catalogApi'
import { useToast } from '../../hooks/useToast'
import { Card, Badge, SeoPreview, ImageUpload } from '../../components/admin/AdminUI'
import { ExportButtons } from '../../components/admin/ExportButtons'
import { CategorySelect } from '../../components/admin/CategorySelect'
import { Icon } from '../../components/common/Icon'
import { Link } from 'react-router-dom'
import styles from './AdminProductsPage.module.css'

export function AdminProductsPage() {
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DRAFT'>('ALL')
  const [products, setProducts] = useState<ProductSummaryDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)
  const [images, setImages] = useState<any[]>([])

  // Form State
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [threeDModelUrl, setThreeDModelUrl] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | string>('')
  const [description, setDescription] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await catalogApi.listAllAdmin(page - 1, 20)
      if (res.data?.success && res.data.data) {
        setProducts(res.data.data)
        if (res.data.page) {
          setTotalPages(res.data.page.totalPages)
          setTotalElements(res.data.page.totalElements)
        }
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể tải danh sách sản phẩm' })
    } finally {
      setLoading(false)
    }
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
      setThreeDModelUrl(editProduct.threeDModelUrl || '')
      setName(editProduct.name || '')
      setPrice(editProduct.price || '')
      setDescription(editProduct.description || '')
    } else {
      setMetaTitle('')
      setMetaDescription('')
      setSlug('')
      setThreeDModelUrl('')
      setSelectedCategoryId('')
      setName('')
      setPrice('')
      setDescription('')
      setImages([{ url: '', altText: '', sortOrder: 0, primary: true }])
    }

    // Refetch categories whenever modal opens to ensure fresh data
    if (showModal) {
      catalogApi.getCategoryTree().then(res => {
        if (res.data?.success) setCategories(res.data.data)
      })
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

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    try {
      const res = await catalogApi.delete(productId)
      if (res.data?.success) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        addToast({ type: 'success', message: 'Đã xóa sản phẩm' })
      }
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const res = currentStatus === 'ACTIVE' 
        ? await catalogApi.update(productId, { status: 'INACTIVE' })
        : await catalogApi.activate(productId)
      
      if (res.data?.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p))
        addToast({ type: 'success', message: `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'ẩn'} sản phẩm` })
      }
    } catch { addToast({ type: 'error', message: 'Thao tác thất bại' }) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const rawData = Object.fromEntries(formData.entries())
    
    const payload = {
      ...rawData,
      name,
      price: Number(price),
      description,
      compareAtPrice: rawData.compareAtPrice ? Number(rawData.compareAtPrice) : null,
      costPerItem: rawData.costPerItem ? Number(rawData.costPerItem) : null,
      weightKg: rawData.weightKg ? Number(rawData.weightKg) : null,
      tags: (rawData.tags as string)?.split(',').map(t => t.trim()).filter(t => t) || [],
      categoryId: selectedCategoryId || null,
      status: editProduct ? editProduct.status : 'ACTIVE',
      images: images.filter(img => img.url),
      metaTitle,
      metaDescription,
      slug,
      threeDModelUrl
    }

    setLoading(true)
    try {
      if (editProduct) {
        const res = await catalogApi.update(editProduct.id, payload)
        if (res.data?.success) {
          await fetchProducts()
          addToast({ type: 'success', message: 'Cập nhật thành công' })
        }
      } else {
        const res = await catalogApi.create(payload)
        if (res.data?.success) {
          setProducts(prev => [res.data.data, ...prev])
          addToast({ type: 'success', message: 'Đã tạo sản phẩm mới' })
        }
      }
      setShowModal(false)
    } catch (err: any) { 
        addToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lưu sản phẩm' }) 
    } finally { setLoading(false) }
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchActive = activeFilter === 'ALL' || p.status === activeFilter
    return matchSearch && matchActive
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Sản phẩm</h1>
          <p className={styles.pageSub}>Thiết lập thông tin sản phẩm và mô hình 3D cao cấp</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ExportButtons 
            module="product"
            data={filtered} 
            fileName="products-report" 
            pdfTitle="BÁO CÁO DANH SÁCH SẢN PHẨM"
            headers={['Tên sản phẩm', 'Danh mục', 'Giá', 'Trạng thái']}
            mapping={(p) => [
              p.name,
              p.categoryName || 'N/A',
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price),
              p.status
            ]}
          />
          <button className={styles.btnPrimary} onClick={() => { setEditProduct(null); setShowModal(true); }}>
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
            <Icon.Search size={18} className={styles.searchIcon} />
            <input 
              className={styles.searchInput} 
              placeholder="Tìm kiếm sản phẩm theo tên, SKU..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
        </div>
        <select className={styles.select} value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as any)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bán</option>
          <option value="INACTIVE">Đã ẩn</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá niêm yết</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Không tìm thấy sản phẩm nào.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productCell}>
                    <img src={p.imageUrl || 'https://placehold.co/80'} alt={p.name} className={styles.tableImg} />
                    <div>
                      <div className={styles.productName}>{p.name}</div>
                      <div className={styles.productSku}>SKU: {p.sku || 'N/A'} {p.threeDModelUrl && <Badge type="success">3D READY</Badge>}</div>
                    </div>
                  </div>
                </td>
                <td><Badge type="info">{p.categoryName || 'Chưa phân loại'}</Badge></td>
                <td>
                   <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                   {p.compareAtPrice && <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.compareAtPrice)}</div>}
                </td>
                <td>
                  <Badge type={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {p.status === 'ACTIVE' ? 'Đang bán' : p.status === 'INACTIVE' ? 'Đã ẩn' : 'Bản nháp'}
                  </Badge>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      className={styles.actionBtn} 
                      onClick={async () => { 
                        try {
                          setLoading(true)
                          const res = await catalogApi.get(p.id)
                          if (res.data?.success) {
                            setEditProduct(res.data.data)
                            setShowModal(true)
                          }
                        } catch {
                          addToast({ type: 'error', message: 'Không thể lấy thông tin chi tiết sản phẩm' })
                        } finally {
                          setLoading(false)
                        }
                      }} 
                      title="Sửa"
                    >
                      <Icon.Edit size={16} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleToggleStatus(p.id, p.status)} title={p.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}>
                        <Icon.Eye size={16} color={p.status === 'ACTIVE' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(p.id)} title="Xóa"><Icon.Trash size={16} /></button>
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <button className={styles.btnGhost} onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSave}>
                <div className={styles.formLayout}>
                  <div className={styles.leftCol}>
                    <Card title="Thông tin cơ bản">
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tên sản phẩm</label>
                        <input name="name" className={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="Ví dụ: iPhone 15 Pro Max" />
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
                        <label className={styles.label}>Mô tả chi tiết</label>
                        <textarea name="description" className={styles.textarea} style={{ minHeight: 150 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả đặc điểm nổi bật..." />
                      </div>
                    </Card>

                    <Card title="Trải nghiệm 3D" description="Đường dẫn đến mô hình .glb để hiển thị trong Viewer 3D.">
                       <div className={styles.formGroup}>
                        <label className={styles.label}>3D Model URL (.glb)</label>
                        <input 
                            value={threeDModelUrl} 
                            onChange={(e) => setThreeDModelUrl(e.target.value)} 
                            className={styles.input} 
                            placeholder="https://example.com/model.glb" 
                        />
                      </div>
                      <p className={styles.hint}>Để trống nếu không hỗ trợ xem 3D.</p>
                    </Card>

                    <Card title="Hình ảnh sản phẩm">
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
                                onClick={() => setImages([...images, { url: '', altText: '', sortOrder: images.length, primary: images.length === 0 }])}
                            >
                                <div className={styles.addSlotContent}>
                                  <Icon.Plus size={20} />
                                  <span className={styles.addSlotLabel}>Thêm ảnh</span>
                                </div>
                            </button>
                         )}
                      </div>
                    </Card>

                    <Card title="Cấu hình SEO">
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Đường dẫn (Slug)</label>
                        <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={styles.input} required placeholder="iphone-15-pro" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tiêu đề SEO</label>
                        <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={styles.input} placeholder="Tiêu đề hiển thị trên Google" maxLength={300} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Mô tả SEO</label>
                        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={styles.textarea} style={{ minHeight: 80 }} placeholder="Mô tả ngắn gọn cho công cụ tìm kiếm (tốt nhất < 160 ký tự)" maxLength={1000} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tags (Cùng dấu phẩy)</label>
                        <input name="tags" className={styles.input} defaultValue={editProduct?.tags?.join(', ')} placeholder="Hot, New, Summer..." />
                      </div>
                      <SeoPreview title={metaTitle} description={metaDescription} slug={slug} />
                    </Card>
                  </div>

                  <div className={styles.rightCol}>
                    <Card title="Trạng thái & Phân loại">
                       <div className={styles.formGroup}>
                        <label className={styles.label}>Hiển thị</label>
                        <select name="visibility" className={styles.selectInput} defaultValue={editProduct?.visibility || 'PUBLIC'}>
                          <option value="PUBLIC">Công khai trên Web</option>
                          <option value="HIDDEN">Ẩn khỏi cửa hàng</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Danh mục</label>
                        <CategorySelect 
                          categories={categories}
                          value={selectedCategoryId}
                          onChange={setSelectedCategoryId}
                        />
                      </div>
                    </Card>

                    <Card title="Giá bán">
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Giá bán hiện tại (₫)</label>
                        <input name="price" type="number" className={styles.input} value={price} onChange={e => setPrice(e.target.value)} required min={0} step={1000} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Giá niêm yết (₫)</label>
                        <input name="compareAtPrice" type="number" className={styles.input} defaultValue={editProduct?.compareAtPrice} min={0} step={1000} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Giá vốn (Cost) (₫)</label>
                        <input name="costPerItem" type="number" className={styles.input} defaultValue={editProduct?.costPerItem} min={0} step={1000} />
                      </div>
                    </Card>

                    <Card title="Trạng thái Kho" description="Số lượng tồn kho được cập nhật tự động từ module Inventory.">
                        <div className={styles.inventoryLink}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tồn kho hiện tại:</span>
                                <Badge type={editProduct?.stockQuantity > 0 ? 'success' : 'neutral'}>
                                    {editProduct?.stockQuantity || 0} sản phẩm
                                </Badge>
                            </div>
                            <Link to="/admin/inventory" className={styles.link}>Đi tới Quản lý Kho để điều chỉnh →</Link>
                        </div>
                    </Card>

                    <Card title="Vận chuyển">
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Cân nặng</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input name="weightKg" type="number" step="0.01" className={styles.input} defaultValue={editProduct?.weightKg} style={{ flex: 1 }} />
                            <select name="weightUnit" className={styles.selectInput} defaultValue={editProduct?.weightUnit || 'KG'} style={{ width: 80 }}>
                                <option value="KG">kg</option>
                                <option value="G">g</option>
                            </select>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                     {loading ? 'Đang xử lý...' : (editProduct ? 'Lưu thay đổi' : 'Đăng sản phẩm')}
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