import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../lib/constants'
import styles from './ErrorPage.module.css'

export function UnauthorizedPage() {
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.errorCode} data-text="401">401</h1>
        <h2 className={styles.title}>DỪNG LẠI!</h2>
        <p className={styles.description}>
          Bạn cần đăng nhập để có thể tiếp tục "vòng đua" này. Hệ thống cần biết bạn là ai để cấp quyền truy cập.
        </p>
        <div className={styles.actions}>
          <Link to={ROUTES.LOGIN} className={`${styles.btn} ${styles.btnPrimary}`}>
            ĐĂNG NHẬP NGAY
          </Link>
          <Link to={ROUTES.HOME} className={`${styles.btn} ${styles.btnSecondary}`}>
            TRANG CHỦ
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
