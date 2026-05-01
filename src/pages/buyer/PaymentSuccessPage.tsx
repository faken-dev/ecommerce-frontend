import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../lib/constants'
import { orderApi } from '../../api/orderApi'
import { paymentApi } from '../../api/paymentApi'
import styles from './PaymentSuccessPage.module.css'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING')
  
  const [orderInfo, setOrderInfo] = useState<any>(null)
  
  // Extract info from callback
  const orderIdFromUrl = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  const successParam = searchParams.get('success')
  const resultCode = searchParams.get('resultCode')

  const verifyPayment = useCallback(async () => {
    // If it's a known failure from gateway
    if (successParam === 'false' || (resultCode && resultCode !== '0')) {
      setStatus('ERROR')
      return
    }

    let currentOrderId = orderIdFromUrl

    // If we only have paymentId, we need to fetch the orderId first
    if (!currentOrderId && paymentId) {
      try {
        const payRes = await paymentApi.getById(paymentId)
        if (payRes.data?.success) {
          currentOrderId = payRes.data.data.orderId
        }
      } catch (e) {
        console.error('Error fetching payment for orderId:', e)
      }
    }

    if (!currentOrderId && !paymentId) {
      setStatus('ERROR')
      return
    }

    let attempts = 0
    const maxAttempts = 8 // Increased to 8 attempts (16s total)

    const poll = async () => {
      try {
        // If we have orderId, check its status
        if (currentOrderId) {
          const response = await orderApi.getById(currentOrderId)
          if (response.data?.success) {
            setOrderInfo(response.data.data)
            if (response.data.data.paymentStatus === 'PAID') {
              setStatus('SUCCESS')
              return
            }
          }
        }
        
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 2000)
        } else {
          setStatus('ERROR')
        }
      } catch (err) {
        console.error('Error verifying payment:', err)
        if (attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 2000)
        } else {
            setStatus('ERROR')
        }
      }
    }

    poll()
  }, [orderIdFromUrl, paymentId, successParam, resultCode])

  useEffect(() => {
    verifyPayment()
  }, [verifyPayment])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {status === 'LOADING' && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Đang xác nhận dữ liệu thanh toán...</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <motion.div 
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.iconSuccess}>✓</div>
            <h1 className={styles.title}>Thanh toán thành công!</h1>
            <p className={styles.desc}>
              Cảm ơn bạn đã đặt hàng. Đơn hàng <strong>#{orderInfo?.id?.slice(0, 8) || orderIdFromUrl?.slice(0, 8) || 'MỚI'}</strong> của bạn đang được xử lý.
            </p>
            <div className={styles.actions}>
              <Link to={ROUTES.BUYER_ORDERS} className={styles.btnPrimary}>Xem đơn hàng</Link>
              <Link to={ROUTES.HOME} className={styles.btnGhost}>Về trang chủ</Link>
            </div>
          </motion.div>
        )}

        {status === 'ERROR' && (
          <motion.div 
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.iconError}>!</div>
            <h1 className={styles.title}>Trạng thái thanh toán</h1>
            <p className={styles.desc}>
              Hệ thống chưa nhận được thông báo thanh toán thành công hoặc có lỗi xảy ra. 
              Vui lòng kiểm tra lại Lịch sử đơn hàng sau ít phút.
            </p>
            <div className={styles.actions}>
              <Link to={ROUTES.BUYER_ORDERS} className={styles.btnPrimary}>Kiểm tra đơn hàng</Link>
              <Link to={ROUTES.HOME} className={styles.btnGhost}>Về trang chủ</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
