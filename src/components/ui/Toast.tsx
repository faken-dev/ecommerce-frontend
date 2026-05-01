import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast, type ToastData } from '../../hooks/useToast'
import styles from './Toast.module.css'

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const icons = { success: '✓', error: '✕', warning: '!', info: 'i' }

  return (
    <motion.div
      className={`${styles.toast} ${styles[toast.type]}`}
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className={styles.icon}>{icons[toast.type]}</span>
      <div className={styles.content}>
        {toast.title && <p className={styles.title}>{toast.title}</p>}
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button
        className={styles.close}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div className={styles.container} aria-live="polite" aria-label="Notifications">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
