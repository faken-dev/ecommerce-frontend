import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './AuthPage.module.css'

interface RegisterForm {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

interface RegisterErrors {
  fullName?: string
  email?: string
  phoneNumber?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { add: addToast } = useToast()

  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    window.location.href = `/oauth2/authorization/${provider}`
  }

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên'
    else if (form.fullName.trim().length < 2) newErrors.fullName = 'Tên phải có ít nhất 2 ký tự'

    if (!form.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (form.phoneNumber && !/^(0|84|\+84)[0-9]{9,10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ'
    }

    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (form.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Mật khẩu không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})
    try {
      let formattedPhone = form.phoneNumber.trim()
      if (formattedPhone) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+84' + formattedPhone.slice(1)
        } else if (formattedPhone.startsWith('84')) {
          formattedPhone = '+' + formattedPhone
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+84' + formattedPhone // default to VN
        }
      }

      const { data: response } = await authApi.register({
        email: form.email,
        password: form.password,
        fullName: form.fullName.trim(),
        phoneNumber: formattedPhone || undefined,
      })

      addToast({
        type: 'success',
        title: 'Đăng ký thành công!',
        message: response.message || 'Vui lòng kiểm tra email để xác thực tài khoản.',
      })
      navigate(ROUTES.VERIFY_OTP, { 
        replace: true,
        state: { email: form.email }
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message || 'Tạo tài khoản thất bại. Vui lòng thử lại.'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const update = (field: keyof RegisterForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
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
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoMark}>◈</div>
            <h1 className={styles.title}>Tạo tài khoản</h1>
            <p className={styles.subtitle}>
              Tham gia cùng chúng tôi · Miễn phí và dễ dàng
            </p>
          </div>

          {/* Error */}
          {errors.general && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>!</span>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={update('fullName')}
              error={errors.fullName}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Số điện thoại (tùy chọn)"
              type="tel"
              placeholder="0912 345 678"
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
              error={errors.phoneNumber}
              autoComplete="tel"
              hint="Để khôi phục tài khoản nếu quên mật khẩu"
            />

            <div className={styles.passwordRow}>
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ít nhất 8 ký tự"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                autoComplete="new-password"
                rightIcon={<EyeIcon off={showPassword} />}
                onRightIconClick={() => setShowPassword((v) => !v)}
              />
            </div>

            <Input
              label="Xác nhận mật khẩu"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightIcon={<EyeIcon off={showConfirm} />}
              onRightIconClick={() => setShowConfirm((v) => !v)}
            />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Tạo tài khoản
            </Button>
          </form>
          
          <div className={styles.divider}>
            <span>hoặc tiếp tục với</span>
          </div>

          <div className={styles.socialRow}>
            <button 
              className={styles.socialBtn} 
              type="button"
              onClick={() => handleSocialLogin('google')}
            >
              <GoogleIcon />
              Google
            </button>
            <button 
              className={styles.socialBtn} 
              type="button"
              onClick={() => handleSocialLogin('facebook')}
            >
              <FacebookIcon />
              Facebook
            </button>
          </div>

          <p className={styles.footer}>
            Đã có tài khoản?{' '}
            <Link to={ROUTES.LOGIN} className={styles.footerLink}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}