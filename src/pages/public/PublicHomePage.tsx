import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { catalogApi, type ProductSummaryDTO } from '../../api/catalogApi'
import { BannerBar } from '../../components/ecommerce/BannerSlider'
import styles from './PublicHomePage.module.css'

/* ─── Hero Redesign ─────────────────────────────────────────────────────────── */
function Hero() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroImageWrap}>
        <img 
          src="/hero_redesign_mockup_1777084831723.png" 
          alt="Atmospheric Hardware" 
          className={styles.heroImage} 
        />
        <div className={styles.heroGradient} />
      </div>
      
      <div className="container">
        <div className={styles.heroContent}>
          <motion.div 
            initial={{ opacity: 0, letterSpacing: '1em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1 }}
            className={styles.heroTag}
          >
            {t('home.hero_tag')} // ACCESS_GRANTED
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={styles.heroTitle}
          >
            <div>{t('home.hero_title')}</div>
            <div className={styles.accentText}>{t('home.hero_title_accent')}</div>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className={styles.heroDesc}
          >
            {t('home.hero_desc')}
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            onSubmit={handleSearch}
            className={styles.searchBar}
          >
            <input 
              type="text" 
              placeholder={t('home.search_placeholder') || 'SEARCH_UNITS_DATABASE...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </motion.form>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className={styles.heroActions}
          >
            <Link to="/products">
              <button className={styles.btnPrimary}>{t('home.btn_catalog')}</button>
            </Link>
            <button className={styles.btnOutline}>{t('home.btn_heritage')}</button>
          </motion.div>
        </div>
      </div>
      
      <div className={styles.scrollIndicator}>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className={styles.mouse}
        />
      </div>
    </section>
  )
}

/* ─── System Hub (Integrated Stats & Promos) ─────────────────────────────── */
function SystemHub() {
  const { t } = useTranslation();
  return (
    <div className={styles.systemHub}>
      <div className="container">
        <div className={styles.hubGrid}>
          {[
            { label: t('home_hub.item_1.label'), value: t('home_hub.item_1.value'), desc: t('home_hub.item_1.desc') },
            { label: t('home_hub.item_2.label'), value: t('home_hub.item_2.value'), desc: t('home_hub.item_2.desc') },
            { label: t('home_hub.item_3.label'), value: t('home_hub.item_3.value'), desc: t('home_hub.item_3.desc') },
            { label: t('home_hub.item_4.label'), value: t('home_hub.item_4.value'), desc: t('home_hub.item_4.desc') }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={styles.hubItem}
            >
            <div className={styles.hubLabel}>{item.label}</div>
            <div className={styles.hubValue}>{item.value}</div>
            <div className={styles.hubDesc}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Product Card Redesign ───────────────────────────────────────────────── */
function ProductCard({ product, index }: { product: ProductSummaryDTO; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={styles.productCard}
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.idTag}>UNIT_ID: {product.id.substring(0, 8).toUpperCase()}</span>
        <span className={styles.statusTag}>STABLE</span>
      </div>
      
      <div className={styles.imageWrap}>
        <img src={product.imageUrl || 'https://placehold.co/600'} alt={product.name} className={styles.productImage} />
      </div>
      
      <h3 className={styles.title}>{product.name.toUpperCase()}</h3>
      
      <div className={styles.cardFooter}>
        <div className={styles.priceContainer}>
          <span className={styles.price}>
             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </span>
        </div>
        <div className={styles.detailsBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export function PublicHomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductSummaryDTO[]>([])

  useEffect(() => {
    catalogApi.listPublic(0, 3)
      .then(res => {
        if (res.data?.success && res.data.data) setProducts(res.data.data)
      })
  }, [])

  return (
    <div className={styles.page}>
      <Hero />
      <SystemHub />

      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subTitle}>{t('home_featured.tag')}</span>
              <h2 className={styles.sectionTitle}>{t('home_featured.title')}</h2>
            </div>
            <Link to="/products">
              <button className={styles.viewAllBtn}>
                {t('home_featured.btn_view_all')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </Link>
          </div>
          <div className={styles.productGrid}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <BannerBar />

      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <span className={styles.subTitle}>{t('home_contact.tag')}</span>
              <h2 className={styles.sectionTitle}>
                {t('home_contact.title')}<br/>
                <span className={styles.accentText}>{t('home_contact.title_accent')}</span>
              </h2>
              <p className={styles.heroDesc} style={{ margin: '32px 0' }}>
                {t('home_contact.desc')}
              </p>
            </div>
            
            <div className={styles.formContainer}>
              <form className={styles.contactForm}>
                <input className={styles.input} type="text" placeholder={t('home_contact.form.name')} />
                <input className={styles.input} type="email" placeholder={t('home_contact.form.email')} />
                <textarea className={styles.textarea} rows={4} placeholder={t('home_contact.form.message')} />
                <button className={styles.submitBtn}>
                  {t('home_contact.form.btn_send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
