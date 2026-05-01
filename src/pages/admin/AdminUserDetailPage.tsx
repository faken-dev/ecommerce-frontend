import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userApi } from '../../api/userApi'
import { useToast } from '../../hooks/useToast'
import { Card, Badge } from '../../components/admin/AdminUI'
import { Icon } from '../../components/common/Icon'
import styles from './AdminProductsPage.module.css'

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      userApi.getUserProfile(id)
        .then(res => {
          if (res.data?.success) setUser(res.data.data)
        })
        .catch(() => addToast({ type: 'error', message: 'Không thể tải thông tin người dùng' }))
        .finally(() => setLoading(false))
    }
  }, [id])



  if (loading) return <div style={{ padding: '2rem' }}>Đang tải...</div>
  if (!user) return <div style={{ padding: '2rem' }}>Không tìm thấy người dùng</div>

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.btnGhost} onClick={() => navigate(-1)}>
          <Icon.ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className={styles.pageTitle}>Chi tiết người dùng</h1>
      </div>

        <div className={styles.formLayout}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card title="Thông tin tài khoản">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className={styles.label}>Email</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user.email}
                    {user.emailVerified && <Badge type="success">Đã xác minh</Badge>}
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Trạng thái</label>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge type={user.active ? 'success' : 'error'}>{user.active ? 'Hoạt động' : 'Bị khóa'}</Badge>
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Vai trò</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {user.roles?.map((r: string) => <Badge key={r} type="warning">{r}</Badge>)}
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Ngày tạo</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)' }}>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Thông tin hồ sơ">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className={styles.label}>Họ và tên</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)' }}>{user.fullName}</div>
                </div>
                <div>
                  <label className={styles.label}>Số điện thoại</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)' }}>{user.phoneNumber || '—'}</div>
                </div>
                <div>
                  <label className={styles.label}>Giới tính</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)' }}>{user.gender || '—'}</div>
                </div>
                <div>
                  <label className={styles.label}>Ngày sinh</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)' }}>{user.dateOfBirth || '—'}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className={styles.label}>Giới thiệu (Bio)</label>
                  <div className={styles.input} style={{ background: 'var(--bg-secondary)', minHeight: '80px', height: 'auto' }}>
                    {user.bio || 'Chưa có thông tin giới thiệu'}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Danh sách địa chỉ">
              {user.addresses?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {user.addresses.map((addr: any) => (
                    <div key={addr.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{addr.recipientName} ({addr.recipientPhone})</strong>
                        {addr.defaultAddress && <Badge type="success">Mặc định</Badge>}
                      </div>
                      <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{addr.fullAddress}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.5, padding: '1rem' }}>Người dùng chưa thêm địa chỉ nào</p>
              )}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card title="Ảnh đại diện">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '2px solid var(--border)', 
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {user.profilePictureUrl ? (
                        <img 
                            src={user.profilePictureUrl} 
                            alt="Avatar" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.3 }}>
                            <Icon.User size={80} />
                        </div>
                    )}
                </div>
                <p className={styles.pageSub} style={{ margin: 0, opacity: 0.6 }}>
                  Người dùng tự cập nhật ảnh trong hồ sơ cá nhân
                </p>
              </div>
            </Card>
          </div>
        </div>
    </div>
  )
}
