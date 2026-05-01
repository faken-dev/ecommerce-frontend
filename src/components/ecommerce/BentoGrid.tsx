import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductSummaryDTO } from '../../api/catalogApi'
import styles from './BentoGrid.module.css'

/* ─── Price formatter ───────────────────────────────────────────────────────── */
const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

/* ─── Tech card ─────────────────────────────────────────────────────────────── */
interface BentoCardProps {
  product: ProductSummaryDTO
  size: 'sm' | 'md' | 'lg' | 'xl'
  onAddToCart: (id: string, rect: DOMRect, price: number) => void
}

function BentoCard({ product, size, onAddToCart }: BentoCardProps) {
  const [hovered, setHovered] = useState(false)

  const handleAdd = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (e.currentTarget as HTMLElement).closest('[data-card]')?.getBoundingClientRect() ??
        new DOMRect()
      onAddToCart(product.id, rect, product.price)
    },
    [onAddToCart, product.id, product.price],
  )

  return (
    <motion.div
      data-card
      className={`${styles.card} ${styles[`card--${size}`]}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Product image */}
      <Link to={`/products/${product.slug}`} className={styles.cardImageWrap} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
        <img
          src={product.imageUrl || 'https://placehold.co/600x800'}
          alt={product.name}
          className={styles.cardImage}
          loading="lazy"
        />

        {/* Technical labels */}
        <span className={styles.badge}>REF: {product.categoryName?.toUpperCase() || 'UNIT_00'}</span>

        {/* Low stock alert removed - will be re-added via Inventory API if needed */}
      </Link>

      {/* Technical overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className={styles.glassOverlay}
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={`/products/${product.slug}`} className={styles.glassLink}>
              <p className={styles.glassDesc}>
                {product.tags?.join(' // ') || 'AUTHENTIC_EQUIPMENT_SPEC'}
              </p>
            </Link>
            <div className={styles.glassActions}>
              <span className={styles.glassPrice}>{fmt(product.price)}</span>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                aria-label={`Execute: ${product.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                EXEC_PURCHASE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default footer */}
      <div className={styles.cardBar}>
      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className={styles.cardName}>{product.name}</h3>
        </Link>
        <span className={styles.cardPrice}>{fmt(product.price)}</span>
      </div>
    </motion.div>
  )
}


/* ─── Grid layout template areas (2-col, variable height rows) ──────────────── */
const SIZE_MAP = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
}

interface BentoGridProps {
  products: ProductSummaryDTO[]
  onAddToCart: (id: string, rect: DOMRect, price: number) => void
}

export function BentoGrid({ products, onAddToCart }: BentoGridProps) {
  // Assign sizes in a bento pattern: xl, lg, sm, sm, md, lg, sm, md, sm
  const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = [
    'xl', 'lg', 'sm',
    'sm', 'md', 'lg',
    'sm', 'md', 'sm',
    'lg', 'sm', 'md',
  ]

  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        <div key={product.id} className={`${styles.cell} ${SIZE_MAP[sizes[i % sizes.length]]}`}>
          <BentoCard
            product={product}
            size={sizes[i % sizes.length]}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  )
}
