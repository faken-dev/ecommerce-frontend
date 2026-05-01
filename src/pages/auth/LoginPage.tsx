import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { ROUTES } from '../../lib/constants'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import styles from './AuthPage.module.css'

interface LoginForm {
  email: string
  password: string
}

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const { add: addToast } = useToast()

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME

  // Handle OAuth2 redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (accessToken && refreshToken) {
      handleOAuthSuccess(accessToken, refreshToken)
    }
  }, [location])

  const handleOAuthSuccess = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true)
    try {
      sessionStorage.setItem('ec_access_token', accessToken)
      sessionStorage.setItem('ec_refresh_token', refreshToken)
      
      const { data: response } = await authApi.getMe()
      const user = response.data
      
      login(user)
      addToast({ type: 'success', title: 'Chào mừng!', message: `Đăng nhập thành công với ${user.fullName}` })
      navigate(from, { replace: true })
    } catch (err) {
      addToast({ type: 'error', message: 'Lỗi xác thực mạng xã hội' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    window.location.href = `/oauth2/authorization/${provider}`
  }

  const validate = (): boolean => {
    const newErrors: LoginErrors = {}
    if (!form.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
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
      const { data: response } = await authApi.login(form)
      // Backend trả LoginResponse: { user, tokens: { accessToken, refreshToken } }
      const { user, tokens } = response.data

      sessionStorage.setItem('ec_access_token', tokens.accessToken)
      sessionStorage.setItem('ec_refresh_token', tokens.refreshToken)
      login(user)

      addToast({ type: 'success', title: 'Chào mừng trở lại!', message: `Chào ${user.fullName || 'bạn'}` })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } }
      const msg = axiosErr?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const update = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className={styles.page}>
      {/* Background decorative blobs */}
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Top accent bar */}
        <div className={styles.topBar} aria-hidden="true" />

        <div className={styles.body}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoMark}>◈</div>
            <h1 className={styles.title}>Đăng nhập</h1>
            <p className={styles.subtitle}>
              Chào buổi sáng · Rất vui được gặp bạn trở lại
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                className={styles.errorBanner}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className={styles.errorIcon}>!</span>
                {errors.general}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="email"
            />

            <div className={styles.passwordRow}>
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                autoComplete="current-password"
                rightIcon={
                  <EyeIcon off={showPassword} />
                }
                onRightIconClick={() => setShowPassword((v) => !v)}
              />
            </div>

            <div className={styles.forgotRow}>
              <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Đăng nhập
            </Button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span>hoặc tiếp tục với</span>
          </div>

          {/* Social login buttons */}
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

          {/* Footer */}
          <p className={styles.footer}>
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className={styles.footerLink}>
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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