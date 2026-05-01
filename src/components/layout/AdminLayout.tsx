import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { authApi } from '../../api/authApi'
import { ROUTES, PERMISSIONS, ROLES } from '../../lib/constants'
import { Icon } from '../../components/common/Icon'
import styles from './AdminLayout.module.css'

interface NavItem {
  label: string
  path: string
  permission?: string
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Hệ thống & Báo cáo',
    items: [
      { label: 'Tổng quan', path: ROUTES.ADMIN_DASHBOARD, permission: PERMISSIONS.VIEW_ANALYTICS, icon: <Icon.Grid size={18} /> },
      { label: 'Báo cáo / Phân tích', path: ROUTES.ADMIN_ANALYTICS, permission: PERMISSIONS.VIEW_ANALYTICS, icon: <Icon.BarChart size={18} /> },
      { label: 'Lịch sử hệ thống', path: '/admin/audit-logs', permission: PERMISSIONS.VIEW_ROLES, icon: <Icon.Shield size={18} /> },
      { label: 'Thông báo hệ thống', path: '/admin/notifications', permission: PERMISSIONS.MANAGE_NOTIFICATIONS, icon: <Icon.Bell size={18} /> },
    ]
  },
  {
    label: 'Kinh doanh',
    items: [
      { label: 'Quản lý Đơn hàng', path: ROUTES.ADMIN_ORDERS, permission: PERMISSIONS.VIEW_ORDERS, icon: <Icon.Clipboard size={18} /> },
      { label: 'Quản lý Thanh toán', path: ROUTES.ADMIN_PAYMENTS, permission: PERMISSIONS.VIEW_PAYMENTS, icon: <Icon.Wallet size={18} /> },
      { label: 'Quản lý Vận chuyển', path: ROUTES.ADMIN_SHIPPING, permission: PERMISSIONS.VIEW_ORDERS, icon: <Icon.Truck size={18} /> },
      { label: 'Quản lý Vouchers', path: ROUTES.ADMIN_VOUCHERS, permission: PERMISSIONS.VIEW_VOUCHERS, icon: <Icon.Ticket size={18} /> },
    ]
  },
  {
    label: 'Sản phẩm & Kho',
    items: [
      { label: 'Quản lý Products', path: ROUTES.ADMIN_PRODUCTS, permission: PERMISSIONS.VIEW_PRODUCTS, icon: <Icon.Package size={18} /> },
      { label: 'Quản lý Danh mục', path: ROUTES.ADMIN_CATEGORIES, permission: PERMISSIONS.VIEW_CATEGORIES, icon: <Icon.Grid size={18} /> },
      { label: 'Quản lý Kho', path: '/admin/inventory', permission: PERMISSIONS.MANAGE_PRODUCTS, icon: <Icon.Archive size={18} /> },
      { label: 'Cấu trúc Kho hàng', path: ROUTES.ADMIN_WAREHOUSES, permission: PERMISSIONS.MANAGE_PRODUCTS, icon: <Icon.Grid size={18} /> },
    ]
  },
  {
    label: 'Người dùng & Quyền',
    items: [
      { label: 'Quản lý Users', path: ROUTES.ADMIN_USERS, permission: PERMISSIONS.VIEW_USERS, icon: <Icon.Users size={18} /> },
      { label: 'Quản lý Roles', path: ROUTES.ADMIN_ROLES, permission: PERMISSIONS.VIEW_ROLES, icon: <Icon.Shield size={18} /> },
    ]
  },
  {
    label: 'Cấu hình',
    items: [
      { label: 'Banner & CMS', path: '/admin/cms', permission: PERMISSIONS.VIEW_ANALYTICS, icon: <Icon.Image size={18} /> },
      { label: 'Cài đặt hệ thống', path: '/admin/settings', permission: PERMISSIONS.VIEW_ROLES, icon: <Icon.Settings size={18} /> },
    ]
  }
]

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const { user, logout, hasPermission } = useAuthStore()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const handleMobileToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  // Admin-only gate
  if (!user?.roles?.includes(ROLES.ADMIN)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('ec_refresh_token')
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // ignore
    }
    logout()
    addToast({ type: 'success', message: 'Đã đăng xuất. Hẹn gặp lại!' })
    navigate(ROUTES.LOGIN)
  }

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || hasPermission(item.permission))
  })).filter(group => group.items.length > 0)

  return (
    <div className={`${styles.root} admin-suite`}>
      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoTop}>
            <div className={styles.logoIcon}>◈</div>
            <div className={styles.logoInfo}>
              <span className={styles.logoText}>AdminHub</span>
              <span className={styles.logoSub}>Hệ thống quản trị</span>
            </div>
          </div>
        </div>

        {/* Nav with Groups */}
        <nav className={styles.nav}>
          {visibleGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.label)
            return (
              <div key={group.label} className={styles.navGroup}>
                <div 
                  className={styles.groupHeader} 
                  onClick={() => toggleGroup(group.label)}
                >
                  <span className={styles.groupLabel}>{group.label}</span>
                  <Icon.ChevronDown 
                    size={12} 
                    className={styles.groupChevron}
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                  />
                </div>
                {isExpanded && (
                  <div className={styles.groupItems}>
                    {group.items.map((item) => {
                      const active = location.pathname === item.path
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        >
                          <span className={styles.navIcon}>{item.icon}</span>
                          <span className={styles.navLabel}>{item.label}</span>
                          {active && <span className={styles.activeDot} />}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className={styles.sidebarFooter}>
          <div
            className={styles.userCard}
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.userAvatar}>
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.fullName?.charAt(0).toUpperCase() ?? 'A'
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName}</span>
              <div className={styles.userMeta}>
                <span className={styles.userEmail}>{user?.email}</span>
                {user?.phoneNumber && <span className={styles.userPhone}>· {user.phoneNumber}</span>}
              </div>
            </div>
            <Icon.ChevronDown size={14} style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {/* User popup - REDESIGNED per image 4 */}
          {showUserMenu && (
            <div className={styles.userPopup}>
              <div className={styles.popupTop}>
                <div className={styles.popupAvatarBig}>
                  {user?.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="" />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase() ?? 'A'
                  )}
                </div>
                <div className={styles.popupInfoBig}>
                  <div className={styles.popupNameBig}>{user?.fullName}</div>
                  <div className={styles.popupEmailBig}>{user?.email}</div>
                </div>
              </div>
              
              <div className={styles.popupActions}>
                <button
                  className={styles.actionBtnSmall}
                  onClick={() => { setShowUserMenu(false); navigate(ROUTES.BUYER_PROFILE) }}
                >
                  <Icon.User size={14} /> Hồ sơ cá nhân
                </button>
                <button
                  className={styles.actionBtnSmall}
                  onClick={() => { setShowUserMenu(false); navigate(ROUTES.HOME) }}
                >
                  <Icon.Home size={14} /> Xem trang chủ
                </button>
                <button
                  className={`${styles.actionBtnSmall} ${styles.actionBtnDanger}`}
                  onClick={handleLogout}
                >
                  <Icon.LogOut size={14} /> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.mobileToggle} onClick={handleMobileToggle}>
              {isMobileMenuOpen ? <Icon.X size={24} /> : <Icon.Menu size={24} />}
            </button>
            <span className={styles.pageTitle}>
              {NAV_GROUPS.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || 'Quản trị hệ thống'}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <Link to={ROUTES.BUYER_PROFILE} className={styles.topbarLink}>
              <Icon.User size={18} />
              <span>Hồ sơ</span>
            </Link>
            <Link to={ROUTES.HOME} className={styles.topbarLink}>
              <Icon.Home size={18} />
              <span>Trang chủ</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

