import { Icon } from '../common/Icon'
import styles from '../../pages/buyer/CheckoutPage.module.css'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

interface OrderSummaryProps {
  subtotal: number
  shippingFee: number
  discountAmount: number
  total: number
  voucherCode: string
  onVoucherChange: (code: string) => void
  onApplyVoucher: () => void
  onSubmit: () => void
  loading: boolean
  validatingVoucher: boolean
  error: string | null
  paymentMethod: string
  canSubmit: boolean
}

export function OrderSummary({
  subtotal,
  shippingFee,
  discountAmount,
  total,
  voucherCode,
  onVoucherChange,
  onApplyVoucher,
  onSubmit,
  loading,
  validatingVoucher,
  error,
  paymentMethod,
  canSubmit
}: OrderSummaryProps) {
  return (
    <div className={styles.summaryCard}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Tóm tắt đơn hàng</h2>
      
      <div className={styles.voucherBox}>
        <input 
          type="text" 
          placeholder="Nhập mã giảm giá..." 
          value={voucherCode}
          onChange={(e) => onVoucherChange(e.target.value.toUpperCase())}
          className={styles.input}
        />
        <button 
          onClick={onApplyVoucher}
          disabled={validatingVoucher || !voucherCode.trim()}
          className={styles.applyBtn}
        >
          {validatingVoucher ? '...' : 'Áp dụng'}
        </button>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}

      <div className={styles.summaryTable}>
        <div className={styles.summaryRow}>
          <span className={styles.label}>Tổng tiền hàng</span>
          <span className={styles.value}>{fmt(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.label}>Phí vận chuyển</span>
          <span className={styles.value}>{fmt(shippingFee)}</span>
        </div>
        {discountAmount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.label}>Giảm giá</span>
            <span className={styles.value} style={{ color: 'var(--accent-primary)' }}>
              -{fmt(discountAmount)}
            </span>
          </div>
        )}
        <div className={styles.totalRowWrap}>
          <span className={styles.totalLabel}>Tổng thanh toán</span>
          <span className={styles.totalValue}>{fmt(total)}</span>
        </div>
      </div>
      
      <button 
        onClick={onSubmit}
        disabled={loading || !canSubmit}
        className={styles.checkoutBtn}
      >
        {loading ? 'Đang xử lý...' : paymentMethod === 'COD' ? 'Xác nhận đặt hàng' : `Thanh toán ngay`}
      </button>

      <div className={styles.securityNotice}>
        <Icon.Shield size={14} /> Bảo mật thanh toán bởi Lando Platform
      </div>
    </div>
  )
}
