import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cmsApi, type BannerDTO } from '../../api/cmsApi'
import styles from './BannerSlider.module.css'

export function BannerBar() {
  const [banners, setBanners] = useState<BannerDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cmsApi.getActiveBanners()
      .then(res => {
        if (res.data?.success && res.data.data) {
          setBanners(res.data.data.sort((a, b) => (b.priority || 0) - (a.priority || 0)))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || banners.length === 0) return null

  return (
    <section className={styles.bannerSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.subTitle}>SYSTEM_PROMOTIONS</span>
          <h2 className={styles.sectionTitle}>ACTIVE_NODES</h2>
        </div>
        <div className={styles.bannerGrid}>
          {banners.slice(0, 4).map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={styles.bannerCard}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title || 'Banner'} 
                  className={styles.image}
                />
                <div className={styles.overlay} />
              </div>
              
              <div className={styles.content}>
                <span className={styles.index}>0{i + 1} // PROMO_NODE</span>
                <h3 className={styles.title}>{banner.title?.toUpperCase() || 'UNIT_ACCESS'}</h3>
                {banner.linkUrl && (
                  <a href={banner.linkUrl} className={styles.link}>
                    LINK_START
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
