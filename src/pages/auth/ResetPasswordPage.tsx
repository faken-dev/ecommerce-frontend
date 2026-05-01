import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useToast } from '../../hooks/useToast'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './AuthPage.module.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { add: addToast } = useToast()

  const [email] = useState(location.state?.email || '')
  const [otpCode] = useState(location.state?.otpCode || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await authApi.resetPassword({
        email,
        otpCode: otpCode,
        newPassword
      })

      addToast({
        type: 'success',
        title: 'Thành công!',
        message: 'Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.',
      })
      navigate(ROUTES.LOGIN)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string, errors?: Record<string, string> } } }
      const backendErrors = axiosErr?.response?.data?.errors
      
      if (backendErrors) {
        const firstError = Object.values(backendErrors)[0]
        setError(firstError)
      } else {
        setError(axiosErr?.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !otpCode) {
    return (
      <div className={styles.page}>
         <div className={styles.card}>
            <div className={styles.body}>
              <h1 className={styles.title}>Lỗi truy cập</h1>
              <p className={styles.subtitle}>Thiếu thông tin xác thực để đặt lại mật khẩu.</p>
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
            <h1 className={styles.title}>Đặt lại mật khẩu</h1>
            <p className={styles.subtitle}>
              Vui lòng nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError('') }}
              error={error && error.includes('8 ký tự') ? error : ''}
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              error={error && error.includes('không khớp') ? error : ''}
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Lưu mật khẩu mới
            </Button>
          </form>

          <p className={styles.footer}>
            <Link to={ROUTES.LOGIN} className={styles.footerLink}>
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
