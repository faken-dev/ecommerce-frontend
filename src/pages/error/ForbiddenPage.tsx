import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '../../lib/constants'
import styles from './ErrorPage.module.css'

export function ForbiddenPage() {
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.errorCode} data-text="403">403</h1>
        <h2 className={styles.title}>KHU VỰC CẤM</h2>
        <p className={styles.description}>
          Bạn không có quyền truy cập vào "gara" này. Vui lòng kiểm tra lại quyền hạn của mình hoặc liên hệ đội ngũ kỹ thuật.
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
