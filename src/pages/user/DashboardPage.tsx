import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useAuthStore()

  const firstName = user?.fullName?.split(' ').slice(-1)[0] || 'bạn'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buổi sáng tốt lành' : hour < 18 ? 'Chiều vui vẻ' : 'Buổi tối an nhiên'

  return (
    <div className={styles.page}>
      {/* Hero greeting */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.avatarLarge}>
            {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <h1 className={styles.greeting}>
              {greeting}, <span className={styles.name}>{firstName}</span>
            </h1>
            <p className={styles.subGreeting}>
              Rất vui được gặp bạn trở lại · Chúc một ngày tuyệt vời
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          { label: 'Trạng thái tài khoản', value: user?.active ? 'Hoạt động' : 'Bị khóa', color: user?.active ? '#4caf50' : '#ff5252' },
          { label: 'Email đã xác thực', value: user?.emailVerified ? 'Đã xác thực' : 'Chưa xác thực', color: user?.emailVerified ? '#4caf50' : 'var(--accent-secondary)' },
          { label: 'Đăng nhập qua', value: user?.provider === 'GOOGLE' ? 'Google' : 'Email', color: 'var(--accent-primary)' },
          { label: 'Vai trò', value: user?.roles?.[0] || 'Người dùng', color: 'var(--text-secondary)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          >
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue} style={{ color: stat.color }}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
        <div className={styles.quickGrid}>
          {[
            { label: 'Chỉnh sửa hồ sơ', desc: 'Cập nhật thông tin cá nhân', href: '/profile' },
            { label: 'Quản lý địa chỉ', desc: 'Thêm, sửa địa chỉ giao hàng', href: '/addresses' },
            { label: 'Đơn hàng của tôi', desc: 'Theo dõi và xem lịch sử mua hàng', href: '#' },
            { label: 'Cài đặt bảo mật', desc: 'Đổi mật khẩu, bật 2FA', href: '#' },
          ].map((action) => (
            <a key={action.label} href={action.href} className={styles.quickCard}>
              <span className={styles.quickLabel}>{action.label}</span>
              <span className={styles.quickDesc}>{action.desc}</span>
              <span className={styles.quickArrow}>→</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
