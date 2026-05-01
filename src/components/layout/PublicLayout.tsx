import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { authApi } from '../../api/authApi'
import { useToast } from '../../hooks/useToast'
import { ROUTES, ROLES } from '../../lib/constants'
import { NotificationBell } from '../user/NotificationBell'
import styles from './PublicLayout.module.css'

const PUBLIC_NAV = [
  { label: 'Trang chủ', path: ROUTES.HOME },
  { label: 'Sản phẩm', path: '/products' },
  { label: 'Liên hệ', path: '/contact' },
]

const BUYER_NAV = [
  { label: 'Hồ sơ', path: ROUTES.BUYER_PROFILE },
  { label: 'Địa chỉ', path: ROUTES.BUYER_PROFILE + '?tab=addresses' },
  { label: 'Đơn hàng', path: ROUTES.BUYER_ORDERS },
  { label: 'Yêu thích', path: ROUTES.WISHLIST },
]

export function PublicLayout() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { i18n } = useTranslation()
  const { add: addToast } = useToast()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Update HTML lang attribute for CSS selectors (like font switching)
  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith('vi') ? 'vi' : 'en'
  }, [i18n.language])

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
    setShowUserMenu(false)
  }

  const isBuyerRoute = ([
    ROUTES.BUYER_PROFILE,
    ROUTES.BUYER_ADDRESSES,
    ROUTES.BUYER_ORDERS,
  ] as string[]).includes(location.pathname)

  const activeNav = isBuyerRoute ? [...PUBLIC_NAV, ...BUYER_NAV] : PUBLIC_NAV

  return (
    <div className={styles.root}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Store</span>
          </Link>

          <div className={styles.links}>
            {activeNav.map((item) => {
              const fullCurrentPath = location.pathname + location.search
              const isActive = item.path.includes('?') 
                ? fullCurrentPath === item.path 
                : location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className={styles.userArea}>
            <Link to={ROUTES.CART} className={styles.cartBtn} id="navbar-cart-btn">
              <CartIcon />
              <CartBadge />
            </Link>

            {isAuthenticated && <NotificationBell />}

            <div className={styles.langSwitcher}>
              <button 
                className={`${styles.langBtn} ${i18n.language.startsWith('vi') ? styles.langBtnActive : ''}`}
                onClick={() => i18n.changeLanguage('vi')}
              >
                VI
              </button>
              <span className={styles.langDivider}>|</span>
              <button 
                className={`${styles.langBtn} ${i18n.language.startsWith('en') ? styles.langBtnActive : ''}`}
                onClick={() => i18n.changeLanguage('en')}
              >
                EN
              </button>
            </div>

            {isAuthenticated && user ? (
              <div className={styles.userDropdown}>
                <button
                  className={styles.userBtn}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className={styles.avatar}>
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt="" className={styles.avatarImg} />
                    ) : (
                      user.fullName?.charAt(0).toUpperCase() ?? 'U'
                    )}
                  </div>
                  <span className={styles.userName}>{user.fullName}</span>
                  <ChevronIcon rotated={showUserMenu} />
                </button>

                {showUserMenu && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt="" className={styles.avatarImg} />
                        ) : (
                          user.fullName?.charAt(0).toUpperCase() ?? 'U'
                        )}
                      </div>
                      <div>
                        <div className={styles.dropdownName}>{user.fullName}</div>
                        <div className={styles.dropdownEmail}>{user.email}</div>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    {user.roles?.includes(ROLES.ADMIN) && (
                      <>
                        <Link
                          to={ROUTES.ADMIN_DASHBOARD}
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <AdminIcon /> Trang quản trị
                        </Link>
                        <div className={styles.dropdownDivider} />
                      </>
                    )}
                    <Link
                      to={ROUTES.BUYER_PROFILE}
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ProfileIcon /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      to={ROUTES.BUYER_ORDERS}
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <OrderIcon /> Đơn hàng của tôi
                    </Link>
                    <Link
                      to={ROUTES.WISHLIST}
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <WishlistIcon /> Sản phẩm yêu thích
                    </Link>
                    <Link
                      to={ROUTES.BUYER_PROFILE + '?tab=addresses'}
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <MapIcon /> Sổ địa chỉ
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                      <LogoutIcon /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authGroup}>
                <Link to={ROUTES.LOGIN} className={styles.btnLogin}>Đăng nhập</Link>
                <Link to={ROUTES.REGISTER} className={styles.btnRegister}>Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span className={styles.logoMark}>◈</span>
            <span>Store</span>
          </div>
          <p className={styles.footerDesc}>Nền tảng thương mại điện tử công nghệ cao · 2026</p>
          <div className={styles.footerLinks}>
            <Link to="/contact">Liên hệ</Link>
            <Link to="/shipping-policy">Vận chuyển</Link>
            <Link to="/privacy">Chính sách</Link>
            <Link to="/terms">Điều khoản</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChevronIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function ProfileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function OrderIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
}
function MapIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function AdminIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
function WishlistIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
function CartBadge() {
  const itemCount = useCartStore((s) => s.cart?.itemCount ?? 0)
  if (itemCount === 0) return null
  return <span className={styles.badge}>{itemCount}</span>
}
