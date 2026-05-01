import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../lib/constants'
import styles from './ErrorPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.errorCode} data-text="404">404</h1>
        <h2 className={styles.title}>LẠC ĐƯỜNG RỒI!</h2>
        <p className={styles.description}>
          Trang bạn đang tìm kiếm có vẻ như đã "văng khỏi đường đua" hoặc chưa bao giờ tồn tại.
        </p>
        <div className={styles.actions}>
          <Link to={ROUTES.HOME} className={`${styles.btn} ${styles.btnPrimary}`}>
            VỀ TRANG CHỦ
          </Link>
          <button onClick={() => window.history.back()} className={`${styles.btn} ${styles.btnSecondary}`}>
            QUAY LẠI
          </button>
        </div>
      </motion.div>
    </div>
  )
}
