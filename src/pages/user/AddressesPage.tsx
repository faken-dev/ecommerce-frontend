import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { userApi } from '../../api/userApi'
import { useToast } from '../../hooks/useToast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { VietnamAddressSelector } from '../../components/ui/VietnamAddressSelector'
import type { Address, CreateAddressRequest } from '../../types'
import styles from './AddressesPage.module.css'

export function AddressesPage() {
  const { add: addToast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateAddressRequest>({
    recipientName: '',
    recipientPhone: '',
    addressLine: '',
    ward: '',
    district: '',
    province: '',
    defaultAddress: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = () => {
    setIsLoading(true)
    userApi.getAddresses()
      .then(({ data }) => setAddresses(data.data || []))
      .catch(() => addToast({ type: 'error', message: 'Không thể tải danh sách địa chỉ' }))
      .finally(() => setIsLoading(false))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipientName || !form.recipientPhone || !form.addressLine || !form.ward || !form.district || !form.province) {
      addToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin' })
      return
    }
    setIsSaving(true)
    try {
      if (editingId) {
        await userApi.updateAddress(editingId, form)
        addToast({ type: 'success', message: 'Địa chỉ đã được cập nhật' })
      } else {
        await userApi.createAddress(form)
        addToast({ type: 'success', message: 'Địa chỉ mới đã được thêm' })
      }
      resetForm()
      fetchAddresses()
    } catch {
      addToast({ type: 'error', message: 'Lưu thất bại. Thử lại.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa địa chỉ này?')) return
    try {
      await userApi.deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      addToast({ type: 'success', message: 'Địa chỉ đã được xóa' })
    } catch {
      addToast({ type: 'error', message: 'Xóa thất bại' })
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await userApi.setDefaultAddress(id)
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, defaultAddress: a.id === id }))
      )
      addToast({ type: 'success', message: 'Địa chỉ mặc định đã được thay đổi' })
    } catch {
      addToast({ type: 'error', message: 'Cập nhật thất bại' })
    }
  }

  const startEdit = (addr: Address) => {
    setEditingId(addr.id)
    setForm({
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      addressLine: addr.addressLine,
      ward: addr.ward,
      district: addr.district,
      province: addr.province,
      defaultAddress: addr.defaultAddress,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ recipientName: '', recipientPhone: '', addressLine: '', ward: '', district: '', province: '', defaultAddress: false })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className={styles.title}>Địa chỉ giao hàng</h1>
          <p className={styles.subtitle}>Quản lý địa chỉ nhận hàng của bạn</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>＋ Thêm địa chỉ</Button>
        )}
      </motion.div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSave} className={styles.form}>
              <h3 className={styles.formTitle}>{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>

              <div className={styles.row}>
                <Input
                  label="Tên người nhận"
                  placeholder="Nguyễn Văn A"
                  value={form.recipientName}
                  onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                />
                <Input
                  label="Số điện thoại"
                  placeholder="0912 345 678"
                  value={form.recipientPhone}
                  onChange={(e) => setForm((p) => ({ ...p, recipientPhone: e.target.value }))}
                />
              </div>

              <Input
                label="Địa chỉ cụ thể"
                placeholder="123 Đường ABC..."
                value={form.addressLine}
                onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
              />

              <VietnamAddressSelector 
                initialValues={{ province: form.province, district: form.district, ward: form.ward }}
                onSelect={(data) => setForm(p => ({ ...p, ...data }))}
              />

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.defaultAddress}
                  onChange={(e) => setForm((p) => ({ ...p, defaultAddress: e.target.checked }))}
                />
                Đặt làm địa chỉ mặc định
              </label>

              <div className={styles.formActions}>
                <Button variant="ghost" type="button" onClick={resetForm}>Hủy</Button>
                <Button type="submit" isLoading={isSaving}>{editingId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address list */}
      {isLoading ? (
        <div className={styles.skeletonList}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <motion.div
          className={styles.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.emptyIcon}>📍</div>
          <p>Chưa có địa chỉ nào</p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>＋ Thêm địa chỉ đầu tiên</Button>
        </motion.div>
      ) : (
        <div className={styles.list}>
          {addresses.map((addr, i) => (
            <motion.div
              key={addr.id}
              className={styles.addrCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {addr.defaultAddress && (
                <div className={styles.defaultBadge}>Mặc định</div>
              )}
              <div className={styles.addrMain}>
                <div className={styles.addrMeta}>
                  <span className={styles.recipientName}>{addr.recipientName}</span>
                  <span className={styles.sep}>·</span>
                  <span className={styles.phone}>{addr.recipientPhone}</span>
                </div>
                <p className={styles.addrLine}>{addr.addressLine}</p>
                <p className={styles.addrGeo}>{addr.ward}, {addr.district}, {addr.province}</p>
              </div>
              <div className={styles.addrActions}>
                {!addr.defaultAddress && (
                  <button className={styles.actionBtn} onClick={() => handleSetDefault(addr.id)}>Đặt mặc định</button>
                )}
                <button className={styles.editBtn} onClick={() => startEdit(addr)}>Sửa</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(addr.id)}>Xóa</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
