import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { authApi } from '../../api/authApi'
import { useSettingsStore } from '../../store/settingsStore'
import { ROUTES, PERMISSIONS, ROLES } from '../../lib/constants'
import type { Permission } from '../../lib/constants'
import { Icon } from '../../components/common/Icon'
import styles from './SellerLayout.module.css'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan', path: ROUTES.SELLER_DASHBOARD, permission: PERMISSIONS.VIEW_ANALYTICS, icon: <GridIcon /> },
  { label: 'Sản phẩm của tôi', path: ROUTES.SELLER_PRODUCTS, permission: PERMISSIONS.MANAGE_PRODUCTS, icon: <PackageIcon /> },
  { label: 'Vận hành tồn kho', path: '/seller/inventory', permission: PERMISSIONS.MANAGE_PRODUCTS, icon: <Icon.Archive size={18} /> },
  { label: 'Đơn hàng', path: ROUTES.SELLER_ORDERS, permission: PERMISSIONS.VIEW_ORDERS, icon: <ClipboardIcon /> },
  { label: 'Khuyến mãi', path: ROUTES.SELLER_VOUCHERS, permission: PERMISSIONS.VIEW_VOUCHERS, icon: <TicketIcon /> },
  { label: 'Quản lý kho (WMS)', path: '/seller/warehouse', permission: PERMISSIONS.MANAGE_PRODUCTS, icon: <ArchiveIcon /> },
  { label: 'Báo cáo / Phân tích', path: '/seller/analytics', permission: PERMISSIONS.VIEW_ANALYTICS, icon: <BarChartIcon /> },
]

export function SellerLayout() {
  const { user, logout, hasPermission } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const location = useLocation()

  if (!user?.roles?.includes(ROLES.SELLER) && !user?.roles?.includes(ROLES.ADMIN)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('ec_refresh_token')
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      /* ignore */
    }
    logout()
    addToast({ type: 'success', message: 'Đã đăng xuất!' })
    navigate(ROUTES.LOGIN)
  }

  const { settings } = useSettingsStore()
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.path === '/seller/warehouse' && !settings.warehousingEnabled) return false
    return !item.permission || hasPermission(item.permission)
  })

  return (
    <div className={`${styles.root} admin-suite`}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>SellerHub</span>
          <span className={styles.logoBadge}>SELLER</span>
        </div>
        <div className={styles.sectionLabel}>Quản lý cửa hàng</div>
        <nav className={styles.nav}>
          {visibleItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {active && <span className={styles.activeDot} />}
              </Link>
            )
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.fullName?.charAt(0).toUpperCase() ?? 'S'
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
            <LogoutIcon />
          </button>
        </div>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>
            {visibleItems.find((i) => i.path === location.pathname)?.label ?? 'Seller'}
          </span>
          <div className={styles.topbarRight}>
            <Link to={ROUTES.BUYER_PROFILE} className={styles.topbarLink}><ProfileIcon /><span>Hồ sơ</span></Link>
            <Link to={ROUTES.HOME} className={styles.topbarLink}><HomeIcon /><span>Trang chủ</span></Link>
          </div>
        </header>
        <main className={styles.content}><Outlet /></main>
      </div>
    </div>
  )
}

function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}
function PackageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
}
function ClipboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" /></svg>
}
function TicketIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" /><line x1="13" y1="5" x2="13" y2="19" /></svg>
}
function BarChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
}
function LogoutIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}
function ProfileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>
}
function ArchiveIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
}