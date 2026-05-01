import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { PERMISSIONS, ROUTES } from '../../lib/constants'
import { userApi } from '../../api/userApi'
import { useToast } from '../../hooks/useToast'
import { Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css' // Using shared premium styles

const PAGE_SIZE = 10

export function AdminUsersPage() {
  const { hasPermission } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [users, setUsers] = useState<any[]>([])
  const [, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)

  const canCreate = hasPermission(PERMISSIONS.CREATE_USERS)
  const canDelete = hasPermission(PERMISSIONS.DELETE_USERS)

  const fetchUsers = () => {
    setLoading(true)
    const params: any = { page: page - 1, size: PAGE_SIZE }
    if (selectedRole !== 'ALL') params.role = selectedRole
    if (search) params.search = search

    userApi.listUsers(params)
      .then(res => {
        if (res.data?.success && res.data.data) {
          setUsers(res.data.data)
          if (res.data.page) {
            setTotalElements(res.data.page.totalElements)
            setTotalPages(res.data.page.totalPages)
          }
        }
      })
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [page, selectedRole, search])

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    try {
      const res = await userApi.deleteUser(userId)
      if (res.data?.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setTotalElements(prev => prev - 1)
        addToast({ type: 'success', message: 'Đã xóa người dùng' })
      }
    } catch { addToast({ type: 'error', message: 'Xóa thất bại' }) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    const payload = {
      ...data,
      active: formData.get('active') === 'on',
      emailVerified: formData.get('emailVerified') === 'on',
      roles: [data.role as string]
    }

    try {
      if (editUser) {
        const res = await userApi.updateUser(editUser.id, payload)
        if (res.data?.success) {
          addToast({ type: 'success', message: 'Cập nhật thành công' })
          fetchUsers()
          setShowModal(false)
        }
      } else {
        const res = await userApi.createUser(payload as any)
        if (res.data?.success) {
          addToast({ type: 'success', message: 'Tạo user thành công' })
          fetchUsers()
          setShowModal(false)
        }
      }
    } catch (err: any) {
        addToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi lưu' })
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản trị Người dùng</h1>
          <p className={styles.pageSub}>Quản lý tài khoản, vai trò và bảo mật hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className={styles.btnGhost} 
            onClick={() => userApi.exportUsersExcel(search)}
            title="Xuất Excel"
          >
            <Icon.Download size={18} /> Xuất danh sách
          </button>

          {canCreate && (
            <button className={styles.btnPrimary} onClick={() => { setEditUser(null); setShowModal(true) }}>
              + Thêm tài khoản
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select className={styles.select} value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setPage(1) }}>
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="SELLER">Người bán</option>
          <option value="BUYER">Người mua</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thông tin User</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Xác thực</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && users?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Đang tải dữ liệu...</td></tr>
            ) : users?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Không tìm thấy người dùng nào.</td></tr>
            ) : users?.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.productCell}>
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem'
                      }}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <div className={styles.productName}>{user.fullName}</div>
                      <div className={styles.productSku}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', gap: 4 }}>
                      {user.roles?.map((r: string) => (
                        <Badge key={r} type={r.includes('ADMIN') ? 'error' : r.includes('SELLER') ? 'info' : 'neutral'}>
                          {r.replace('ROLE_', '')}
                        </Badge>
                      ))}
                   </div>
                </td>
                <td>
                  <Badge type={user.active ? 'success' : 'error'}>
                    {user.active ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </td>
                <td>
                  {user.emailVerified 
                    ? <span style={{ color: 'var(--status-success)', fontSize: '0.875rem' }}>✓ Verified</span>
                    : <span style={{ color: 'var(--status-error)', fontSize: '0.875rem' }}>✗ Unverified</span>
                  }
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => navigate(`${ROUTES.ADMIN_USERS}/${user.id}`)} title="Xem chi tiết"><Icon.Eye size={16} /></button>
                    <button 
                      className={styles.actionBtn} 
                      onClick={async () => { 
                        try {
                          setLoading(true)
                          const res = await userApi.getUserProfile(user.id)
                          if (res.data?.success) {
                            setEditUser({ ...user, ...res.data.data })
                            setShowModal(true)
                          }
                        } catch {
                          addToast({ type: 'error', message: 'Không thể tải thông tin chi tiết người dùng' })
                        } finally {
                          setLoading(false)
                        }
                      }} 
                      title="Sửa"
                    >
                      <Icon.Edit size={16} />
                    </button>
                    {canDelete && <button className={styles.actionBtn} onClick={() => handleDelete(user.id)} title="Xóa"><Icon.Trash size={16} /></button>}
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
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Trang {page} / {totalPages}
          </span>
          <button className={styles.btnGhost} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>{editUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h2>
                <button className={styles.btnGhost} onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-lg)' }}>
                     {editUser?.profilePictureUrl ? (
                        <img src={editUser.profilePictureUrl} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                     ) : (
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                           {editUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                     )}
                     <div>
                        <div style={{ fontWeight: 600 }}>{editUser?.fullName || 'Người dùng mới'}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{editUser?.email || 'Chưa có email'}</div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.label}>Họ và tên</label>
                    <input name="fullName" className={styles.input} defaultValue={editUser?.fullName} required placeholder="Nguyễn Văn A" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input name="email" className={styles.input} defaultValue={editUser?.email} required readOnly={!!editUser} placeholder="email@example.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại</label>
                    <input name="phoneNumber" className={styles.input} defaultValue={editUser?.phoneNumber} placeholder="09xxxxxxx" />
                  </div>
                  {!editUser && (
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.label}>Mật khẩu</label>
                      <input name="password" type="password" className={styles.input} required placeholder="••••••••" />
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Vai trò chính</label>
                    <select name="role" className={styles.selectInput} defaultValue={editUser?.roles?.[0] || 'BUYER'}>
                      <option value="BUYER">Người mua (Buyer)</option>
                      <option value="SELLER">Người bán (Seller)</option>
                      <option value="ADMIN">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input name="active" type="checkbox" defaultChecked={editUser?.active ?? true} /> Tài khoản hoạt động
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', marginTop: 8 }}>
                      <input name="emailVerified" type="checkbox" defaultChecked={editUser?.emailVerified ?? false} /> Đã xác thực Email
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                  <button type="button" className={styles.btnGhost} onClick={() => setShowModal(false)}>Đóng</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thông tin'}
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