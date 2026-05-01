import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCheckout } from '../../hooks/useCheckout'
import { AddressSection } from '../../components/checkout/AddressSection'
import { PaymentSection } from '../../components/checkout/PaymentSection'
import { OrderSummary } from '../../components/checkout/OrderSummary'
import { CheckoutItemList } from '../../components/checkout/CheckoutItemList'
import { AddressFormModal } from '../../components/user/AddressFormModal'
import styles from './CheckoutPage.module.css'

/**
 * Refactored CheckoutPage.
 * This component is now lean and focused on layout and coordination.
 * Business logic is delegated to useCheckout hook.
 */
export function CheckoutPage() {
  const location = useLocation()
  const selectedItemIds = location.state?.selectedItemIds as string[] | undefined
  
  const {
    items,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    activeTab,
    setActiveTab,
    voucherCode,
    setVoucherCode,
    discountAmount,
    subtotal,
    total,
    loading,
    error,
    validatingVoucher,
    applyVoucher,
    placeOrder,
    refreshAddresses
  } = useCheckout(selectedItemIds)

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  if (items.length === 0) {
    return (
      <div className={styles.checkoutContainer} style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ fontSize: 32, marginBottom: 24 }}>Giỏ hàng trống</h2>
        <button onClick={() => window.history.back()} className={styles.checkoutBtn} style={{ width: 'auto', padding: '16px 40px' }}>Quay lại</button>
      </div>
    )
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.title}>Thanh toán</h1>
      
      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <AddressSection 
            addresses={addresses} 
            selectedId={selectedAddressId} 
            onSelect={setSelectedAddressId} 
            onAddAddress={() => setIsAddressModalOpen(true)}
          />

          <PaymentSection 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          <CheckoutItemList items={items} />
        </div>

        <aside>
          <OrderSummary 
            subtotal={subtotal}
            shippingFee={0} // Hardcoded for now or fetch from cart
            discountAmount={discountAmount}
            total={total}
            voucherCode={voucherCode}
            onVoucherChange={setVoucherCode}
            onApplyVoucher={applyVoucher}
            onSubmit={placeOrder}
            loading={loading}
            validatingVoucher={validatingVoucher}
            error={error}
            paymentMethod={paymentMethod}
            canSubmit={!!selectedAddressId}
          />
        </aside>
      </div>

      <AddressFormModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={refreshAddresses}
      />
    </div>
  )
}
