import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { PERMISSIONS } from '../../lib/constants'
import { roleApi } from '../../api/roleApi'
import { useToast } from '../../hooks/useToast'
import { Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css'

export function AdminRolesPage() {
  const { hasPermission } = useAuthStore()
  const { add: addToast } = useToast()
  const [roles, setRoles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editRole, setEditRole] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const canCreate = hasPermission(PERMISSIONS.CREATE_ROLES)

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await roleApi.listRoles()
      if (res.data?.success) {
        setRoles(res.data.data)
      }
    } catch {
      addToast({ type: 'error', message: 'Lỗi khi tải danh sách roles' })
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleDelete = async (roleId: string) => {
    if (!window.confirm('Xóa role này?')) return
    try {
      await roleApi.deleteRole(roleId)
      addToast({ type: 'success', message: 'Đã xóa role' })
      fetchRoles()
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const permissions = Array.from(form.querySelectorAll('input[name="permission"]:checked')).map((el: any) => el.value)

    try {
      if (editRole) {
        await roleApi.updateRole(editRole.id, { description, permissions })
        addToast({ type: 'success', message: 'Cập nhật thành công' })
      } else {
        await roleApi.createRole({ name, description, permissions })
        addToast({ type: 'success', message: 'Tạo role thành công' })
      }
      setShowModal(false)
      fetchRoles()
    } catch { addToast({ type: 'error', message: 'Lỗi khi lưu' }) }
    finally { setLoading(false) }
  }

  const groupedPermissions = {
    'Tài khoản': Object.values(PERMISSIONS).filter(p => p.startsWith('user:')),
    'Phân quyền & Vai trò': Object.values(PERMISSIONS).filter(p => p.startsWith('role:') || p.startsWith('permission:')),
    'Danh mục': Object.values(PERMISSIONS).filter(p => p.startsWith('category:')),
    'Sản phẩm': Object.values(PERMISSIONS).filter(p => p.startsWith('product:')),
    'Đơn hàng': Object.values(PERMISSIONS).filter(p => p.startsWith('order:')),
    'Thanh toán & Hoàn tiền': Object.values(PERMISSIONS).filter(p => p.startsWith('payment:')),
    'Khuyến mãi / Voucher': Object.values(PERMISSIONS).filter(p => p.startsWith('voucher:')),
    'Thông báo': Object.values(PERMISSIONS).filter(p => p.startsWith('notification:')),
    'Hệ thống & CMS': Object.values(PERMISSIONS).filter(p => p.startsWith('cms:') || p.startsWith('analytics:')),
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Vai trò & Phân quyền</h1>
          <p className={styles.pageSub}>Thiết lập quyền hạn truy cập cho từng nhóm nhân sự</p>
        </div>
        {canCreate && (
          <button className={styles.btnPrimary} onClick={() => { setEditRole(null); setShowModal(true) }}>
            + Thêm Vai trò
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Tìm tên vai trò hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vai trò</th>
              <th>Mô tả</th>
              <th>Số lượng quyền</th>
              <th>Ngày cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && roles.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map((role) => (
              <tr key={role.id}>
                <td><Badge type={role.name === 'ROLE_ADMIN' ? 'error' : 'info'}>{role.name}</Badge></td>
                <td style={{ fontSize: '0.875rem', color: '#495057' }}>{role.description}</td>
                <td>
                  <span style={{ fontWeight: 600 }}>{new Set(role.permissions || []).size}</span>
                  <span style={{ color: '#adb5bd', fontSize: '0.75rem' }}> quyền</span>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(role.updatedAt || role.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => { setEditRole(role); setShowModal(true); }} title="Sửa"><Icon.Edit size={16} /></button>
                    {role.name !== 'ROLE_ADMIN' && (
                      <button className={styles.actionBtn} onClick={() => handleDelete(role.id)} title="Xóa"><Icon.Trash size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>{editRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}</h2>
                <button className={styles.btnGhost} onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên vai trò (VD: ROLE_MANAGER)</label>
                    <input name="name" className={styles.input} defaultValue={editRole?.name} required readOnly={!!editRole} placeholder="ROLE_XXXX" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mô tả chi tiết</label>
                    <input name="description" className={styles.input} defaultValue={editRole?.description} placeholder="Quản lý kho hàng và đơn hàng..." />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className={styles.label}>Phân quyền chi tiết</label>
                  <div style={{ 
                    maxHeight: 400, overflowY: 'auto', border: '1px solid #eee', 
                    borderRadius: 8, padding: '1.5rem', display: 'grid', gap: '2rem' 
                  }}>
                    {Object.entries(groupedPermissions).map(([group, perms]) => perms.length > 0 && (
                      <div key={group}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f8f9fa' }}>{group}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {perms.map(p => (
                            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem' }}>
                              <input type="checkbox" name="permission" value={p} defaultChecked={editRole?.permissions?.includes(p)} />
                              <span>{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu vai trò'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}