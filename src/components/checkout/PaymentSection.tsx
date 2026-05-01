import { Icon } from '../common/Icon'
import styles from '../../pages/buyer/CheckoutPage.module.css'

interface PaymentSectionProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  paymentMethod: string
  onSelectMethod: (method: string) => void
}

const PAYMENT_GROUPS: Record<string, any[]> = {
  WALLET: [
    { id: 'MOMO', label: 'Ví MoMo', icon: <Icon.Wallet color="#ae2070" />, desc: 'Thanh toán nhanh qua ứng dụng MoMo' },
    { id: 'ZALOPAY', label: 'Ví ZaloPay', icon: <Icon.MessageCircle color="#0084ff" />, desc: 'Thanh toán qua ví ZaloPay' },
    { id: 'PAYPAL', label: 'PayPal', icon: <Icon.Globe color="#003087" />, desc: 'Global payment via PayPal account' },
  ],
  CARD: [
    { id: 'STRIPE', label: 'Visa / Mastercard / JCB', icon: <Icon.CreditCard color="#6772e5" />, desc: 'Xử lý bảo mật qua cổng Stripe' },
  ],
  BANK: [
    { id: 'VNPAY', label: 'Cổng VNPay', icon: <Icon.Zap color="#005baa" />, desc: 'Hỗ trợ tất cả ngân hàng nội địa' },
    { id: 'BANK', label: 'Chuyển khoản trực tiếp', icon: <Icon.Bank color="#4caf50" />, desc: 'Quét mã QR hoặc chuyển khoản thủ công' },
  ],
  COD: [
    { id: 'COD', label: 'Thanh toán khi nhận hàng', icon: <Icon.Package color="#f44336" />, desc: 'Phí thu hộ 0đ' },
  ]
}

export function PaymentSection({ activeTab, setActiveTab, paymentMethod, onSelectMethod }: PaymentSectionProps) {
  return (
    <section className={styles.section} style={{ padding: 0, overflow: 'hidden' }}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.sectionTitle} style={{ margin: 0, padding: '24px 24px 12px' }}>
          <Icon.Wallet size={20} /> Phương thức thanh toán
        </h2>
        
        <div className={styles.tabList}>
          {[
            { id: 'WALLET', label: 'Ví điện tử' },
            { id: 'CARD', label: 'Thẻ Tín dụng/Ghi nợ' },
            { id: 'BANK', label: 'Chuyển khoản / ATM' },
            { id: 'COD', label: 'Thanh toán khi nhận hàng' },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.paymentContent}>
        <div className={styles.paymentMethodsList}>
          {PAYMENT_GROUPS[activeTab].map(method => (
            <label key={method.id} className={`${styles.paymentLabel} ${paymentMethod === method.id ? styles.paymentLabelSelected : ''}`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                checked={paymentMethod === method.id}
                onChange={() => onSelectMethod(method.id)}
                className={styles.radioInput}
              />
              <div className={styles.paymentInfo}>
                <div className={styles.paymentIconWrap}>{method.icon}</div>
                <div className={styles.paymentText}>
                  <span className={styles.methodName}>{method.label}</span>
                  {method.desc && <span className={styles.methodDesc}>{method.desc}</span>}
                </div>
              </div>
              {paymentMethod === method.id && <div className={styles.checkMark}><Icon.Zap size={14} /></div>}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
