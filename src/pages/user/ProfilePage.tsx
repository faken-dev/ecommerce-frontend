import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { userApi } from '../../api/userApi'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/common/Icon'
import { AddressFormModal } from '../../components/user/AddressFormModal'
import type { Gender, Address } from '../../types'
import styles from './ProfilePage.module.css'

type Tab = 'profile' | 'account' | 'addresses'

export function ProfilePage() {
  const { user, login } = useAuthStore()
  const { add: addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'profile'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
    bio: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    phoneNumber: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab
    if (tab && (tab === 'profile' || tab === 'account' || tab === 'addresses')) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const loadData = async () => {
    setIsFetching(true)
    try {
      const [profileRes, addrRes] = await Promise.all([
        userApi.getProfile(),
        userApi.getAddresses()
      ])
      
      const p = profileRes.data.data
      setProfileForm({
        fullName: p.fullName ?? '',
        bio: p.bio ?? '',
        dateOfBirth: p.dateOfBirth ?? '',
        gender: p.gender ?? '',
        phoneNumber: p.phoneNumber ?? '',
      })
      setAddresses(addrRes.data.data)
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể tải thông tin' })
    } finally {
      setIsFetching(false)
    }
  }

  if (isFetching) {
    return <div className={styles.page}><div className={styles.container}>Đang tải...</div></div>
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await userApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        bio: profileForm.bio || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        gender: profileForm.gender as Gender || undefined,
      })
      if (user) login({ ...user, fullName: profileForm.fullName.trim() })
      addToast({ type: 'success', message: 'Đã cập nhật hồ sơ' })
    } catch {
      addToast({ type: 'error', message: 'Cập nhật thất bại' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ type: 'warning', message: 'Mật khẩu xác nhận không khớp' })
      return
    }
    setIsLoading(true)
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      addToast({ type: 'success', message: 'Đã đổi mật khẩu thành công' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại'
      addToast({ type: 'error', message: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'warning', message: 'Ảnh tối đa 2MB' })
      return
    }

    setIsLoading(true)
    try {
      const { storageApi } = await import('../../api/storageApi')
      const uploadRes = await storageApi.upload(file, 'avatars')
      const avatarUrl = uploadRes.data.data.url
      
      await userApi.updateAvatar(avatarUrl)
      
      if (user) {
        login({ ...user, profilePictureUrl: avatarUrl })
      }
      addToast({ type: 'success', message: 'Đã cập nhật ảnh đại diện' })
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể tải ảnh lên' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const res = await userApi.getAddresses()
      setAddresses(res.data.data)
    } catch {
      addToast({ type: 'error', message: 'Không thể tải lại địa chỉ' })
    }
  }

  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setIsAddressModalOpen(true)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return
    try {
      await userApi.deleteAddress(id)
      addToast({ type: 'success', message: 'Đã xóa địa chỉ' })
      fetchAddresses()
    } catch {
      addToast({ type: 'error', message: 'Xóa thất bại' })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Quản lý tài khoản</h1>
            <p className={styles.subtitle}>Cập nhật thông tin cá nhân và bảo mật</p>
          </div>
          <div className={styles.headerRight}>
             <div className={styles.userSummary}>
                <div className={styles.avatarWrapper}>
                   <div className={styles.miniAvatar}>
                      {user?.profilePictureUrl ? (
                         <img src={user.profilePictureUrl} alt="" className={styles.miniAvatarImg} />
                      ) : (
                         user?.fullName?.charAt(0).toUpperCase()
                      )}
                   </div>
                   <label className={styles.avatarUploadBtn} title="Thay đổi ảnh đại diện">
                      <Icon.Image size={12} />
                      <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={isLoading} />
                   </label>
                </div>
                <div>
                   <div className={styles.miniName}>{user?.fullName}</div>
                   <div className={styles.miniEmail}>{user?.email}</div>
                </div>
             </div>
          </div>
        </header>

        <div className={styles.layout}>
          {/* Sidebar Tabs */}
          <aside className={styles.sidebar}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <Icon.User size={18} /> Hồ sơ cá nhân
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'account' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('account')}
            >
              <Icon.Shield size={18} /> Tài khoản & Bảo mật
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'addresses' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('addresses')}
            >
              <Icon.MapPin size={18} /> Sổ địa chỉ
            </button>
          </aside>

          {/* Content Area */}
          <main className={styles.content}>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
                    <form onSubmit={handleProfileSubmit} className={styles.form}>
                      <Input 
                        label="Họ và tên" 
                        value={profileForm.fullName} 
                        onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                      />
                      <div className={styles.grid2}>
                        <Input 
                           label="Số điện thoại" 
                           value={profileForm.phoneNumber} 
                           readOnly
                           hint="Liên kết từ tài khoản Auth"
                        />
                        <div className={styles.field}>
                           <label className={styles.label}>Giới tính</label>
                           <select 
                             className={styles.select}
                             value={profileForm.gender}
                             onChange={e => setProfileForm({...profileForm, gender: e.target.value as Gender})}
                           >
                             <option value="">Chưa chọn</option>
                             <option value="MALE">Nam</option>
                             <option value="FEMALE">Nữ</option>
                             <option value="OTHER">Khác</option>
                           </select>
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Ngày sinh</label>
                        <input 
                           type="date" 
                           className={styles.dateInput}
                           value={profileForm.dateOfBirth}
                           onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Giới thiệu</label>
                        <textarea 
                           className={styles.textarea}
                           value={profileForm.bio}
                           onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                           rows={3}
                        />
                      </div>
                      <Button type="submit" isLoading={isLoading}>Lưu hồ sơ</Button>
                    </form>
                  </section>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Thông tin tài khoản</h2>
                    <div className={styles.authInfo}>
                       <div className={styles.authRow}>
                          <span className={styles.authLabel}>Email</span>
                          <span className={styles.authValue}>{user?.email}</span>
                          {user?.emailVerified ? (
                             <span className={styles.verifiedTag}>✓ Đã xác thực</span>
                          ) : (
                             <span className={styles.unverifiedTag}>⚠ Chưa xác thực</span>
                          )}
                       </div>
                    </div>

                    <h2 className={styles.sectionTitle} style={{marginTop: 32}}>Đổi mật khẩu</h2>
                    <form onSubmit={handlePasswordSubmit} className={styles.form}>
                      <Input 
                        label="Mật khẩu hiện tại" 
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                      <Input 
                        label="Mật khẩu mới" 
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                      <Input 
                        label="Xác nhận mật khẩu mới" 
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      />
                      <Button type="submit" isLoading={isLoading}>Đổi mật khẩu</Button>
                    </form>
                  </section>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div 
                  key="addresses"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <section className={styles.section}>
                    <div className={styles.sectionHeader} style={{ marginBottom: 32 }}>
                       <h2 className={styles.sectionTitle}>Sổ địa chỉ</h2>
                       <Button size="sm" variant="secondary" onClick={handleOpenAddAddress}>+ Thêm địa chỉ mới</Button>
                    </div>
                    
                    <div className={styles.addressList}>
                       {addresses.length === 0 ? (
                         <div className={styles.emptyState}>Chưa có địa chỉ nào</div>
                       ) : (
                         addresses.map(addr => (
                           <div key={addr.id} className={`${styles.addressCard} ${addr.defaultAddress ? styles.addressDefault : ''}`}>
                             <div className={styles.addressInfo}>
                               <div className={styles.addressName}>
                                  {addr.recipientName} 
                                  {addr.defaultAddress && <span className={styles.defaultBadge}>Mặc định</span>}
                               </div>
                               <div className={styles.addressPhone}>{addr.recipientPhone}</div>
                               <div className={styles.addressText}>
                                  {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                               </div>
                             </div>
                             <div className={styles.addressActions}>
                                <button className={styles.actionBtn} onClick={() => handleOpenEditAddress(addr)}>Sửa</button>
                                {!addr.defaultAddress && <button className={styles.actionBtn} onClick={() => handleDeleteAddress(addr.id)}>Xóa</button>}
                             </div>
                           </div>
                         ))
                       )}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <AddressFormModal 
          isOpen={isAddressModalOpen} 
          onClose={() => setIsAddressModalOpen(false)}
          editingAddress={editingAddress}
          onSuccess={fetchAddresses}
        />
      </div>
    </div>
  )
}