import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/authApi'
import { ROUTES } from '../../lib/constants'
import { useToast } from '../../hooks/useToast'
import styles from './Navbar.module.css'
import { NotificationBell } from '../user/NotificationBell'
import { SearchBar } from './SearchBar'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('ec_refresh_token')
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // ignore server error, still clear local state
    }
    logout()
    addToast({ type: 'success', message: 'Đã đăng xuất. Hẹn gặp lại!' })
    navigate(ROUTES.LOGIN)
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to={ROUTES.HOME} className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>Store</span>
        </Link>

        {/* Nav links */}
        <div className={styles.links}>
          <NavLink to={ROUTES.HOME}>Trang chủ</NavLink>
          <NavLink to={ROUTES.BUYER_PROFILE}>Hồ sơ</NavLink>
          <NavLink to={ROUTES.BUYER_ADDRESSES}>Địa chỉ</NavLink>
          <NavLink to={ROUTES.BUYER_ORDERS}>Đơn hàng</NavLink>
        </div>

        <div className={styles.navMain}>
          <SearchBar />
        </div>

        {/* User menu */}
        {user && (
          <div className={styles.userArea}>
            <NotificationBell />
            <div className={styles.avatar}>
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="" className={styles.avatarImg} />
              ) : (
                user.fullName?.charAt(0).toUpperCase() ?? 'U'
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.fullName}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
              <LogoutIcon />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className={styles.navLink}>
      {children}
    </Link>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
