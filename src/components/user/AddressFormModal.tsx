import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { userApi } from '../../api/userApi'
import { useToast } from '../../hooks/useToast'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Icon } from '../common/Icon'
import { VietnamAddressSelector } from '../ui/VietnamAddressSelector'
import type { Address, CreateAddressRequest } from '../../types'

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newAddress?: Address) => void
  editingAddress?: Address | null
}

export function AddressFormModal({ isOpen, onClose, onSuccess, editingAddress }: AddressFormModalProps) {
  const { add: addToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<CreateAddressRequest>({
    recipientName: '',
    recipientPhone: '',
    addressLine: '',
    ward: '',
    district: '',
    province: '',
    defaultAddress: false,
  })

  useEffect(() => {
    if (editingAddress) {
      setForm({
        recipientName: editingAddress.recipientName,
        recipientPhone: editingAddress.recipientPhone,
        addressLine: editingAddress.addressLine,
        ward: editingAddress.ward,
        district: editingAddress.district,
        province: editingAddress.province,
        defaultAddress: editingAddress.defaultAddress,
      })
    } else {
      setForm({
        recipientName: '',
        recipientPhone: '',
        addressLine: '',
        ward: '',
        district: '',
        province: '',
        defaultAddress: false,
      })
    }
  }, [editingAddress, isOpen])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipientName || !form.recipientPhone || !form.addressLine || !form.ward || !form.district || !form.province) {
      addToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin' })
      return
    }
    setIsSaving(true)
    try {
      if (editingAddress) {
        const res = await userApi.updateAddress(editingAddress.id, form)
        addToast({ type: 'success', message: 'Địa chỉ đã được cập nhật' })
        onSuccess(res.data.data)
      } else {
        const res = await userApi.createAddress(form)
        addToast({ type: 'success', message: 'Địa chỉ mới đã được thêm' })
        onSuccess(res.data.data)
      }
      onClose()
    } catch {
      addToast({ type: 'error', message: 'Lưu thất bại. Thử lại.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ 
              position: 'relative', 
              background: 'var(--bg-elevated)', 
              borderRadius: 'var(--radius-xl)', 
              width: '100%', 
              maxWidth: 500, 
              padding: 32,
              border: '1px solid var(--border)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Icon.X size={20} />
            </button>

            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>
              {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ giao hàng'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input
                  label="Tên người nhận"
                  placeholder="Họ và tên"
                  value={form.recipientName}
                  onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                />
                <Input
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0912..."
                  value={form.recipientPhone}
                  onChange={(e) => setForm((p) => ({ ...p, recipientPhone: e.target.value }))}
                />
              </div>

              <Input
                label="Địa chỉ cụ thể"
                placeholder="Số nhà, tên đường..."
                value={form.addressLine}
                onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
              />

              <VietnamAddressSelector 
                initialValues={{ province: form.province, district: form.district, ward: form.ward }}
                onSelect={(data) => setForm(p => ({ ...p, ...data }))}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={form.defaultAddress}
                  onChange={(e) => setForm((p) => ({ ...p, defaultAddress: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }}
                />
                Đặt làm địa chỉ mặc định
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Hủy</Button>
                <Button type="submit" isLoading={isSaving} style={{ flex: 2 }}>{editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
