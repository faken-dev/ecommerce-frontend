import { useState, useEffect } from 'react'
import { Icon } from '../../components/common/Icon'
import { cmsApi, type BannerDTO } from '../../api/cmsApi'
import { useToast } from '../../hooks/useToast'
import { storageApi } from '../../api/storageApi'
import styles from './AdminTablePage.module.css'

export function AdminCmsPage() {
  const { add: addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'BANNERS' | 'PAGES'>('BANNERS')
  const [banners, setBanners] = useState<BannerDTO[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Partial<BannerDTO> | null>(null)
  const [editingPage, setEditingPage] = useState<any | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchBanners = () => {
    setLoading(true)
    cmsApi.getAllBanners()
      .then(res => {
        if (res.data?.success) setBanners(res.data.data)
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải banners' }))
      .finally(() => setLoading(false))
  }

  const fetchPages = () => {
    setLoading(true)
    cmsApi.getAllPages()
      .then(res => {
        if (res.data?.success) setPages(res.data.data)
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách trang' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (activeTab === 'BANNERS') fetchBanners()
    else fetchPages()
  }, [activeTab])

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Xác nhận xóa banner này?')) return
    try {
      await cmsApi.deleteBanner(id)
      addToast({ type: 'success', message: 'Đã xóa banner' })
      fetchBanners()
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const res = await storageApi.upload(file, 'banners')
      if (res.data?.success) {
        setEditingBanner(prev => ({ ...prev, imageUrl: res.data.data.url }))
        addToast({ type: 'success', message: 'Tải ảnh lên thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Tải ảnh thất bại' })
    } finally {
      setUploading(false)
    }
  }
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const payload = {
      id: editingBanner?.id,
      title: formData.get('title') as string,
      imageUrl: formData.get('imageUrl') as string,
      linkUrl: formData.get('linkUrl') as string,
      priority: Number(formData.get('position')),
      status: formData.get('isActive') === 'on' ? 'ACTIVE' : 'INACTIVE'
    }

    try {
      await cmsApi.saveBanner(payload)
      addToast({ type: 'success', message: 'Đã lưu banner' })
      setShowModal(false)
      fetchBanners()
    } catch { addToast({ type: 'error', message: 'Lưu thất bại' }) }
  }

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const payload = {
      id: editingPage?.id,
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
      isActive: formData.get('isActive') === 'on'
    }

    try {
      await cmsApi.savePage(payload)
      addToast({ type: 'success', message: 'Đã lưu nội dung trang' })
      setShowPageModal(false)
      fetchPages()
    } catch { addToast({ type: 'error', message: 'Lưu trang thất bại' }) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Banner & CMS</h1>
          <p className={styles.pageSub}>Quản lý nội dung hiển thị trên trang chủ và các trang tĩnh</p>
        </div>
        {activeTab === 'PAGES' && (
          <button 
            className={styles.btnPrimary} 
            onClick={() => { setEditingPage({ title: '', slug: '', content: '', isActive: true }); setShowPageModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Icon.Plus size={18} />
            Thêm trang mới
          </button>
        )}
      </div>

      <div className={styles.filters} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0, gap: 32 }}>
        <button 
          onClick={() => setActiveTab('BANNERS')}
          style={{ 
            padding: '12px 4px', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'BANNERS' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'BANNERS' ? '2px solid var(--accent-primary)' : 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >Quản lý Banners</button>
        <button 
          onClick={() => setActiveTab('PAGES')}
          style={{ 
            padding: '12px 4px', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'PAGES' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'PAGES' ? '2px solid var(--accent-primary)' : 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >Trang tĩnh (Giới thiệu, CSBH...)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        {activeTab === 'BANNERS' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Đang tải...</div>
            ) : banners.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chưa có banner nào.</div>
            ) : banners.map(banner => (
              <div key={banner.id} className={styles.card} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {banner.status !== 'ACTIVE' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', zIndex: 2 }}>Ẩn</div>
                )}
                <img src={banner.imageUrl} style={{ width: '100%', height: 180, objectFit: 'cover', opacity: banner.status === 'ACTIVE' ? 1 : 0.5 }} alt="" />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{banner.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vị trí: {banner.priority}</span>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className={styles.btnGhost} style={{ fontSize: '0.8125rem' }} onClick={() => { setEditingBanner(banner); setShowModal(true); }}>Chỉnh sửa</button>
                    <button className={styles.btnGhost} style={{ fontSize: '0.8125rem', color: '#ff5252' }} onClick={() => handleDeleteBanner(banner.id)}>Gỡ bỏ</button>
                  </div>
                </div>
              </div>
            ))}
            <div 
              onClick={() => { setEditingBanner({ status: 'ACTIVE', priority: banners.length + 1 }); setShowModal(true); }}
              style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: 12, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 12,
                minHeight: 280,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <Icon.Plus size={32} color="var(--text-muted)" />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Thêm Banner mới</span>
            </div>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên trang</th>
                  <th>Đường dẫn (Slug)</th>
                  <th>Ngày cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td></tr>
                ) : pages.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có trang nào.</td></tr>
                ) : pages.map(page => (
                  <tr key={page.id}>
                    <td className={styles.userName}>{page.title}</td>
                    <td><code>/{page.slug}</code></td>
                    <td>{new Date(page.updatedAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => { setEditingPage(page); setShowPageModal(true); }}
                      >
                        <Icon.Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500, border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 24 }}>{editingBanner?.id ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h2>
            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tiêu đề</label>
                  <input name="title" defaultValue={editingBanner?.title} className={styles.searchInput} style={{ width: '100%' }} required />
               </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hình ảnh Banner</label>
                  <div style={{ 
                    border: '1px dashed var(--border)', 
                    borderRadius: 12, 
                    padding: 16, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 12,
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    {editingBanner?.imageUrl ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <img src={editingBanner.imageUrl} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} alt="" />
                        <button 
                          type="button" 
                          onClick={() => setEditingBanner(prev => ({ ...prev, imageUrl: '' }))}
                          style={{ position: 'absolute', top: -8, right: -8, background: '#ff5252', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Icon.Image size={32} color="var(--text-muted)" />
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 8 }}>Chưa có ảnh</div>
                      </div>
                    )}
                    
                    <label style={{ 
                      background: 'var(--accent-primary)', 
                      color: '#000', 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      fontSize: '0.8125rem', 
                      fontWeight: 700, 
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.7 : 1
                    }}>
                      {uploading ? 'Đang tải...' : 'Chọn ảnh từ máy'}
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
                       <div style={{ height: 1, background: 'var(--border)', flex: 1 }} />
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOẶC DÁN LINK</span>
                       <div style={{ height: 1, background: 'var(--border)', flex: 1 }} />
                    </div>
                    <input 
                      name="imageUrl" 
                      value={editingBanner?.imageUrl || ''} 
                      onChange={e => setEditingBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className={styles.searchInput} 
                      style={{ width: '100%' }} 
                      placeholder="https://..." 
                      required 
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Link điều hướng (Tùy chọn)</label>
                  <input name="linkUrl" defaultValue={editingBanner?.linkUrl} className={styles.searchInput} style={{ width: '100%' }} placeholder="/products/..." />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Thứ tự hiển thị</label>
                    <input name="position" type="number" defaultValue={editingBanner?.priority} className={styles.searchInput} style={{ width: '100%' }} required />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                    <input name="isActive" type="checkbox" defaultChecked={editingBanner?.status === 'ACTIVE'} id="isActive" />
                    <label htmlFor="isActive" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Hiển thị ngay</label>
                  </div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnPrimary}>Lưu banner</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {showPageModal && (
        <div 
          className={styles.modalBackdrop}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowPageModal(false)}
        >
          <div 
            style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 800, border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 24 }}>{editingPage?.id ? 'Chỉnh sửa Trang tĩnh' : 'Thêm Trang mới'}</h2>
            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tiêu đề trang</label>
                    <input name="title" defaultValue={editingPage?.title} className={styles.searchInput} style={{ width: '100%' }} required />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Slug (Ví dụ: about-us)</label>
                    <input name="slug" defaultValue={editingPage?.slug} className={styles.searchInput} style={{ width: '100%' }} required />
                 </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nội dung (Hỗ trợ HTML)</label>
                  <textarea 
                    name="content" 
                    defaultValue={editingPage?.content} 
                    className={styles.searchInput} 
                    style={{ width: '100%', minHeight: 400, fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical' }} 
                    placeholder="<p>Chào mừng bạn đến với shop...</p>"
                    required 
                  />
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input name="isActive" type="checkbox" defaultChecked={editingPage?.isActive ?? true} id="pageIsActive" />
                  <label htmlFor="pageIsActive" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Công khai trang này</label>
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowPageModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnPrimary}>Lưu trang</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
