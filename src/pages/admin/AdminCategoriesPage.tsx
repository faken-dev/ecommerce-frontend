import { useState, useEffect } from 'react'
import { catalogApi, type CategoryDTO } from '../../api/catalogApi'
import { useToast } from '../../hooks/useToast'
import { Card, Badge, TreeSelect } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css' // Reuse the same modern styles

export function AdminCategoriesPage() {
  const { add: addToast } = useToast()
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '' as string | undefined,
    sortOrder: 0,
    iconUrl: ''
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedIds(next)
  }

  const fetchCategories = () => {
    setLoading(true)
    catalogApi.getCategoryTree()
      .then(res => {
        if (res.data?.success && res.data.data) {
          setCategories(res.data.data)
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách danh mục' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', parentId: undefined, sortOrder: 0, iconUrl: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (cat: CategoryDTO) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId,
      sortOrder: cat.sortOrder,
      iconUrl: cat.iconUrl || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingCategory) {
        await catalogApi.updateCategory(editingCategory.id, formData)
        addToast({ type: 'success', message: 'Cập nhật danh mục thành công' })
      } else {
        await catalogApi.createCategory(formData)
        addToast({ type: 'success', message: 'Tạo danh mục thành công' })
      }
      setShowModal(false)
      fetchCategories()
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Thao tác thất bại' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return
    setLoading(true)
    try {
      await catalogApi.deleteCategory(id)
      addToast({ type: 'success', message: 'Đã xóa danh mục' })
      fetchCategories()
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Xóa thất bại' })
    } finally {
      setLoading(false)
    }
  }

  const renderRows = (cats: CategoryDTO[], level = 0): React.ReactNode[] => {
    return cats.flatMap(cat => {
      const isExpanded = expandedIds.has(cat.id)
      const hasChildren = cat.children && cat.children.length > 0
      
      return [
        <tr key={cat.id}>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: level * 28 }}>
              {hasChildren ? (
                <button 
                  className={styles.actionBtn} 
                  style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'transparent' }}
                  onClick={() => toggleExpand(cat.id)}
                >
                  <Icon.ChevronRight 
                    size={14} 
                    style={{ 
                      transform: isExpanded ? 'rotate(90deg)' : 'none', 
                      transition: 'transform 0.2s',
                      color: isExpanded ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }} 
                  />
                </button>
              ) : (
                <div style={{ width: 24 }} />
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 {cat.iconUrl ? (
                   <img src={cat.iconUrl} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} alt="" />
                 ) : (
                   <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Icon.Folder size={18} />
                   </div>
                 )}
                 <div>
                   <div style={{ fontWeight: level === 0 ? 700 : 500, fontSize: level === 0 ? '1rem' : '0.9rem' }}>{cat.name}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {cat.id.substring(0, 8)}...</div>
                 </div>
              </div>
            </div>
          </td>
          <td><code className={styles.slug}>{cat.slug}</code></td>
          <td style={{ maxWidth: 300, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{cat.description || '—'}</td>
          <td style={{ textAlign: 'center' }}>
            <Badge type={(cat.productCount ?? 0) > 0 ? 'info' : 'neutral'}>{cat.productCount ?? 0}</Badge>
          </td>
          <td style={{ textAlign: 'center', fontWeight: 600 }}>{cat.sortOrder}</td>
          <td>
            <div className={styles.actions}>
              <button className={styles.actionBtn} onClick={() => handleOpenEdit(cat)} title="Sửa"><Icon.Edit size={16} /></button>
              <button className={styles.actionBtn} onClick={() => handleDelete(cat.id)} title="Xóa"><Icon.Trash size={16} /></button>
            </div>
          </td>
        </tr>,
        ...(hasChildren && isExpanded ? renderRows(cat.children!, level + 1) : [])
      ]
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Cấu trúc Danh mục</h1>
          <p className={styles.pageSub}>Tổ chức sơ đồ phân cấp sản phẩm khoa học</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleOpenCreate}>+ Thêm danh mục</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Đường dẫn (Slug)</th>
              <th>Mô tả</th>
              <th style={{ textAlign: 'center' }}>Sản phẩm</th>
              <th style={{ textAlign: 'center' }}>Thứ tự</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && categories?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : categories?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Chưa có danh mục nào.</td></tr>
            ) : renderRows(categories)}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h2>
                <button className={styles.btnGhost} onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <Card>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên danh mục</label>
                    <input 
                      className={styles.input} 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Điện thoại & Phụ kiện"
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Slug (đường dẫn)</label>
                    <input 
                      className={styles.input} 
                      value={formData.slug} 
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="dien-thoai-phu-kien"
                      required 
                    />
                  </div>

                  <TreeSelect 
                    label="Danh mục cha"
                    value={formData.parentId}
                    onChange={val => setFormData({ ...formData, parentId: val })}
                    options={(() => {
                      const flatten = (nodes: CategoryDTO[], depth = 0): { id: string, name: string, level: number }[] => {
                        let res: any[] = []
                        nodes.forEach(n => {
                          if (n.id !== editingCategory?.id) {
                            res.push({ id: n.id, name: n.name, level: depth })
                            if (n.children) res = [...res, ...flatten(n.children, depth + 1)]
                          }
                        })
                        return res
                      }
                      return flatten(categories)
                    })()}
                  />
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mô tả ngắn</label>
                    <textarea 
                      className={styles.textarea} 
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ minHeight: 80 }}
                      placeholder="Mô tả tóm tắt về nhóm sản phẩm này..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Thứ tự hiển thị</label>
                    <input 
                      type="number"
                      className={styles.input} 
                      value={formData.sortOrder} 
                      onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {loading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
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
