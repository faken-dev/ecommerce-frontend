import { useState, useEffect } from 'react'
import { voucherApi } from '../../api/voucherApi'
import { useToast } from '../../hooks/useToast'
import type { VoucherDTO } from '../../types'
import styles from './VoucherSection.module.css'

interface VoucherSectionProps {
  sellerId?: string
  productId?: string
}

export function VoucherSection({ sellerId, productId }: VoucherSectionProps) {
  const [vouchers, setVouchers] = useState<VoucherDTO[]>([])
  const [loading, setLoading] = useState(true)
  const { add: addToast } = useToast()

  useEffect(() => {
    setLoading(true)
    voucherApi.listActiveVouchers({ size: 10 })
      .then(res => {
        if (res.data?.success) {
          // Filter by seller or product if needed, for now show all active ones
          const content = res.data.data?.content || []
          const filtered = content.filter(v => 
            (!sellerId || v.sellerId === sellerId)
          )
          setVouchers(filtered)
        }
      })
      .finally(() => setLoading(false))
  }, [sellerId, productId])

  const handleCollect = async (code: string) => {
    try {
      const res = await voucherApi.collectVoucher(code)
      if (res.data?.success) {
        addToast({ type: 'success', message: 'Đã lưu voucher vào túi đồ của bạn!' })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu voucher'
      addToast({ type: 'error', message: msg })
    }
  }

  if (loading || vouchers.length === 0) return null

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>VOUCHERS CỦA SHOP</h3>
      <div className={styles.list}>
        {vouchers.map(v => (
          <div key={v.id} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.code}>{v.code}</span>
              <span className={styles.desc}>{v.description || `Giảm ${v.discountValue}${v.type === 'PERCENTAGE' ? '%' : '₫'}`}</span>
            </div>
            <button className={styles.collectBtn} onClick={() => handleCollect(v.code)}>
              LƯU
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
