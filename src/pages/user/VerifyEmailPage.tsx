import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from '../auth/AuthPage.module.css'

export function VerifyEmailPage() {
  const { user, login, logout } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN)
    } else if (user.emailVerified) {
      navigate(ROUTES.HOME)
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      setError('Mã OTP phải có 6 chữ số')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await authApi.verifyOtp({
        email: user?.email || '',
        code: otp,
        purpose: 'EMAIL_VERIFICATION'
      })

      addToast({
        type: 'success',
        title: 'Thành công!',
        message: 'Tài khoản của bạn đã được xác thực.',
      })
      
      // Update local store state
      if (user) {
        login({ ...user, emailVerified: true })
      }
      
      navigate(ROUTES.HOME)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authApi.sendOtp({
        email: user?.email || '',
        channel: 'EMAIL',
        purpose: 'EMAIL_VERIFICATION'
      })
      addToast({ type: 'success', message: 'Mã xác thực mới đã được gửi tới email của bạn.' })
    } catch {
      addToast({ type: 'error', message: 'Không thể gửi lại mã. Vui lòng thử lại sau.' })
    } finally {
      setIsResending(false)
    }
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
            <h1 className={styles.title}>Xác thực Email</h1>
            <p className={styles.subtitle}>
              Vui lòng nhập mã 6 chữ số đã được gửi tới <br />
              <strong>{user?.email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Mã xác thực"
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
              Xác nhận
            </Button>
          </form>

          <div className={styles.footer}>
            <p>Không nhận được mã?</p>
            <button 
              onClick={handleResend} 
              className={styles.footerLink}
              disabled={isResending}
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
            <div style={{ marginTop: 24 }}>
                <button onClick={() => logout()} className={styles.footerLink} style={{ color: 'var(--text-muted)' }}>
                  Đăng xuất và quay lại
                </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
