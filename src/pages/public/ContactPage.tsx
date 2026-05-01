import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styles from './ContactPage.module.css'

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await new Promise(r => setTimeout(r, 1500))
    setSubmitted(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          
          {/* Left Side: Branding & Info */}
          <div className={styles.hero}>
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.eyebrow}
            >
              [ {t('contact.tag')} ]
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={styles.title}
            >
              {t('contact.title')}
              <span className={styles.titleAccent}> {t('contact.title_accent')}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={styles.desc}
            >
              {t('contact.desc')}
            </motion.p>

            <div className={styles.infoGrid}>
              {[
                { label: t('contact.info.address'), value: '123 Đường Công Nghệ, TP. HCM' },
                { label: t('contact.info.email'), value: 'support@faken.vn' },
                { label: t('contact.info.hotline'), value: '1900 1234' },
                { label: t('contact.info.hours'), value: '08:00 - 21:00' },
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={styles.infoItem}
                >
                  <span className={styles.infoLabel}>{item.label}</span>
                  <span className={styles.infoValue}>{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={styles.formBox}
          >
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successContainer}
              >
                <div className={styles.successIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2 className={styles.successTitle}>{t('contact.info.success_title')}</h2>
                <p className={styles.successDesc}>{t('contact.info.success_desc')}</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className={styles.backBtn}
                >
                  {t('contact.info.btn_another')}
                </button>
              </motion.div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>{t('contact.form.name')}</label>
                    <input 
                      className={styles.input} 
                      required 
                      placeholder={t('contact.info.name_placeholder')}
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t('contact.form.email')}</label>
                    <input 
                      className={styles.input} 
                      type="email" 
                      required 
                      placeholder={t('contact.info.email_placeholder')}
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t('contact.form.message')}</label>
                  <textarea 
                    className={styles.textarea} 
                    rows={6} 
                    required 
                    placeholder={t('contact.info.message_placeholder')}
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  <span>{t('contact.form.btn_send')}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}
