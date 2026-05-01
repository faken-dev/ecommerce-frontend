import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { orderApi } from '../api/orderApi'
import { paymentApi } from '../api/paymentApi'
import { userApi } from '../api/userApi'
import { voucherApi } from '../api/voucherApi'
import { ROUTES } from '../lib/constants'
import type { Address } from '../types'

/**
 * Custom hook to manage the complex checkout process.
 * Encapsulates state, side-effects, and business logic.
 */
export function useCheckout(selectedItemIds?: string[]) {
  const navigate = useNavigate()
  const { cart, fetchCart } = useCartStore()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('MOMO')
  const [activeTab, setActiveTab] = useState('WALLET')
  
  const [voucherCode, setVoucherCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [validatingVoucher, setValidatingVoucher] = useState(false)

  useEffect(() => {
    fetchCart()
    userApi.getAddresses()
      .then(res => {
        if (res.data?.success && res.data.data) {
          setAddresses(res.data.data)
          const defaultAddr = res.data.data.find(a => a.defaultAddress) || res.data.data[0]
          if (defaultAddr) setSelectedAddressId(defaultAddr.id)
        }
      })
      .catch(err => {
        console.error('Failed to fetch addresses', err)
        setError('Không thể tải danh sách địa chỉ')
      })
  }, [fetchCart])

  const checkoutItems = selectedItemIds 
    ? cart?.items.filter(i => selectedItemIds.includes(i.id)) || []
    : cart?.items || []

  const subtotal = checkoutItems.reduce((acc, i) => acc + i.lineTotal, 0)
  const total = Math.max(0, subtotal + (cart?.shippingFee || 0) - (cart?.discountAmount || 0) - discountAmount)

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return
    setValidatingVoucher(true)
    setError(null)
    try {
      const res = await voucherApi.validateVoucher({
        code: voucherCode,
        subtotal,
        shippingFee: cart?.shippingFee,
        productIds: checkoutItems.map(i => i.productId)
      })
      if (res.data?.success && res.data.data.valid) {
        setDiscountAmount(res.data.data.discountAmount)
      } else {
        setError(res.data.data.message || 'Mã giảm giá không hợp lệ')
        setDiscountAmount(0)
      }
    } catch (err) {
      setError('Lỗi khi kiểm tra mã giảm giá')
    } finally {
      setValidatingVoucher(false)
    }
  }

  const placeOrder = async () => {
    if (!selectedAddressId) {
        setError('Vui lòng chọn địa chỉ giao hàng')
        return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const firstSellerId = checkoutItems[0]?.sellerId
      if (!firstSellerId) throw new Error('Seller ID missing')

      const orderRes = await orderApi.placeOrder({
        sellerId: firstSellerId,
        shippingAddressId: selectedAddressId,
        items: checkoutItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          variantTitle: item.variantTitle,
        })),
        subtotal,
        shippingFee: cart?.shippingFee || 0,
        taxAmount: 0,
        discountAmount: (cart?.discountAmount || 0) + discountAmount,
        currency: 'VND',
        voucherCode: discountAmount > 0 ? voucherCode : undefined,
        paymentMethod: paymentMethod === 'BANK' ? 'JPMORGAN_CHASE' : paymentMethod,
      })

      if (orderRes.data?.success) {
        const orderId = orderRes.data.data.id
        const finalAmount = orderRes.data.data.totalAmount
        
        // Payment provider mapping
        const providerMap: Record<string, string> = {
            'MOMO': 'MOMO',
            'ZALOPAY': 'ZALOPAY',
            'PAYPAL': 'PAYPAL',
            'STRIPE': 'STRIPE',
            'VNPAY': 'VNPAY',
            'BANK': 'JPMORGAN_CHASE',
            'COD': 'COD'
        }
        
        const methodTypeMap: Record<string, string> = {
            'MOMO': 'WALLET',
            'ZALOPAY': 'WALLET',
            'PAYPAL': 'WALLET',
            'STRIPE': 'CARD',
            'VNPAY': 'BANK_TRANSFER',
            'BANK': 'BANK_TRANSFER',
            'COD': 'COD'
        }

        const provider = providerMap[paymentMethod] || paymentMethod
        const methodType = methodTypeMap[paymentMethod] || 'WALLET'
        const isRedirectProvider = ['VNPAY', 'ZALOPAY', 'MOMO'].includes(provider)

        const paymentRes = await paymentApi.initiatePayment({
          orderId,
          amount: finalAmount,
          provider: provider as any,
          methodType: methodType as any,
          returnUrl: isRedirectProvider ? undefined : `${window.location.origin}${ROUTES.PAYMENT_SUCCESS}`,
          cancelUrl: `${window.location.origin}${ROUTES.BUYER_ORDERS}`,
        })

        if (paymentRes.data?.success) {
          if (paymentRes.data.data.redirectUrl) {
            window.location.href = paymentRes.data.data.redirectUrl
          } else {
            navigate(`${ROUTES.PAYMENT_SUCCESS}?success=true&paymentId=${paymentRes.data.data.paymentId}&orderId=${paymentRes.data.data.orderId}`)
          }
        } else {
          setError('Lỗi khởi tạo thanh toán')
          navigate(ROUTES.BUYER_ORDERS)
        }
      }
    } catch (err) {
      console.error(err)
      setError('Đã xảy ra lỗi khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  return {
    items: checkoutItems,
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
    refreshAddresses: () => userApi.getAddresses().then(res => res.data?.success && setAddresses(res.data.data))
  }
}
