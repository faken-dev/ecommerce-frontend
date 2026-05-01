import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './AuthPage.module.css'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Vui lòng nhập email'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await authApi.forgotPassword({ email })
      navigate(ROUTES.VERIFY_OTP, { state: { email, purpose: 'PASSWORD_RESET' } })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message || 'Không thể gửi yêu cầu. Thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.topBar} aria-hidden="true" />
        <div className={styles.body}>
          <div className={styles.header}>
            <div className={styles.logoMark}>◈</div>
            <h1 className={styles.title}>Quên mật khẩu</h1>
            <p className={styles.subtitle}>
              Nhập email để nhận mã khôi phục
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              error={error}
              autoComplete="email"
            />
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Gửi mã khôi phục
            </Button>
          </form>

          <p className={styles.footer}>
            Nhớ mật khẩu rồi?{' '}
            <Link to={ROUTES.LOGIN} className={styles.footerLink}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
