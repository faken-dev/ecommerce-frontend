import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { authApi } from '../../api/authApi'
import { ROUTES, REFRESH_TOKEN_KEY } from '../../lib/constants'
import styles from './BuyerLayout.module.css'

const NAV_ITEMS = [
  { label: 'Trang chủ', path: ROUTES.BUYER_DASHBOARD, icon: <HomeIcon /> },
  { label: 'Hồ sơ', path: ROUTES.BUYER_PROFILE, icon: <ProfileIcon /> },
  { label: 'Địa chỉ', path: ROUTES.BUYER_ADDRESSES, icon: <MapIcon /> },
  { label: 'Đơn hàng', path: ROUTES.BUYER_ORDERS, icon: <ClipboardIcon /> },
]

export function BuyerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || ''
      await authApi.logout({ refreshToken })
    } catch { /* ignore */ }
    logout()
    addToast({ type: 'success', message: 'Đã đăng xuất!' })
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className={styles.root}>
      {/* ── Top Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          <Link to={ROUTES.BUYER_DASHBOARD} className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Store</span>
          </Link>

          <div className={styles.links}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}>
                  <span className={styles.navLinkIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className={styles.userArea}>
            <div className={styles.avatar}>{user?.fullName?.charAt(0).toUpperCase() ?? 'U'}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className={styles.main}>
        <div className={styles.contentWrap}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>
}
function ProfileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function MapIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
}
function ClipboardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
}
function LogoutIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}