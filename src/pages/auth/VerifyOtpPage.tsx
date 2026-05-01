import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './AuthPage.module.css'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const { add: addToast } = useToast()
  
  const [email] = useState(location.state?.email || '')
  const [purpose] = useState(location.state?.purpose || 'EMAIL_VERIFICATION')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      setError('Mã OTP phải có 6 chữ số')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const { data: response } = await authApi.verifyOtp({
        email,
        code: otp,
        purpose
      })

      if (purpose === 'PASSWORD_RESET') {
        navigate(ROUTES.RESET_PASSWORD, { state: { email, otpCode: otp } })
        return
      }

      // If backend returned tokens (Auto-login for registration/login purpose)
      const data = response.data as any
      if (data.tokens) {
        const { user, tokens } = data
        sessionStorage.setItem('ec_access_token', tokens.accessToken)
        sessionStorage.setItem('ec_refresh_token', tokens.refreshToken)
        login(user)

        addToast({
          type: 'success',
          title: 'Xác thực thành công!',
          message: `Chào mừng ${user.fullName}, bạn đã được đăng nhập tự động.`,
        })
        navigate(ROUTES.HOME, { replace: true })
      } else {
        addToast({
          type: 'success',
          title: 'Xác thực thành công!',
          message: 'Bây giờ bạn có thể đăng nhập.',
        })
        navigate(ROUTES.LOGIN)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authApi.sendOtp({
        email,
        channel: 'EMAIL',
        purpose
      })
      addToast({ type: 'success', message: 'Mã OTP mới đã được gửi!' })
    } catch {
      addToast({ type: 'error', message: 'Gửi mã thất bại. Thử lại sau.' })
    }
  }

  if (!email) {
    return (
      <div className={styles.page}>
         <div className={styles.card}>
            <div className={styles.body}>
              <h1 className={styles.title}>Lỗi</h1>
              <p className={styles.subtitle}>Thiếu thông tin email để xác thực.</p>
              <Button onClick={() => navigate(ROUTES.LOGIN)} fullWidth>Quay lại Đăng nhập</Button>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobA} />
      <div className={styles.blobB} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.topBar} />
        <div className={styles.body}>
          <div className={styles.header}>
            <div className={styles.logoMark}>◈</div>
            <h1 className={styles.title}>Xác thực tài khoản</h1>
            <p className={styles.subtitle}>
              Mã xác thực đã được gửi tới <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Mã OTP"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                setError('')
              }}
              error={error}
              maxLength={6}
              className={styles.otpInput}
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Xác thực ngay
            </Button>
          </form>

          <p className={styles.footer}>
            Không nhận được mã?{' '}
            <button onClick={handleResend} className={styles.footerLink}>
              Gửi lại mã
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
