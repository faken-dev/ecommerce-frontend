import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BentoGrid } from '../../components/ecommerce/BentoGrid'
import { CartFly, useCartFly } from '../../components/ecommerce/CartFly'
import { catalogApi, type ProductSummaryDTO, type CategoryDTO } from '../../api/catalogApi'
import styles from './ProductsPage.module.css'

/* ─── Showcase Banner ────────────────────────────────────────────────────────── */
function ShowcaseBanner({ products }: { products: ProductSummaryDTO[] }) {
  const { t } = useTranslation();
  return (
    <motion.section className={styles.showcase}>
      <div className={styles.showcaseGrid}>
        {products.slice(0, 6).map((p) => (
          <div 
            key={p.id} 
            className={styles.showcaseCell} 
            style={{ backgroundImage: `url(${p.imageUrl || 'https://placehold.co/600x400'})` }} 
          />
        ))}
      </div>
      <div className={styles.showcaseOverlay}>
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.showcaseTitle}
        >
          {t('products.title').split('.')[0]}<br />
          <span className={styles.showcaseAccent}>UNFILTERED.</span>
        </motion.h1>
      </div>
    </motion.section>
  )
}

/* ─── Filters ────────────────────────────────────────────────────────────────── */
interface Filters {
  category: string
  search: string
  sort: string
}

const defaultFilters: Filters = {
  category: 'ALL',
  search: '',
  sort: 'default',
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export function ProductsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const { trigger, handleAddToCart, handleComplete } = useCartFly()
  const [filtered, setFiltered] = useState<ProductSummaryDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)

  // Helper to find category by name in tree
  const findCategoryByName = (nodes: CategoryDTO[], name: string): CategoryDTO | null => {
    for (const node of nodes) {
      if (node.name === name) return node
      if (node.children) {
        const found = findCategoryByName(node.children, name)
        if (found) return found
      }
    }
    return null
  }

  useEffect(() => {
    catalogApi.getCategoryTree().then(res => {
      if (res.data?.success && res.data.data) setCategories(res.data.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const categoryId = filters.category !== 'ALL' ? findCategoryByName(categories, filters.category)?.id : undefined
    
    catalogApi.search({
      q: filters.search || undefined,
      categoryId: categoryId,
      sortBy: filters.sort !== 'default' ? filters.sort : undefined,
      page: 0,
      size: 12
    } as any).then(res => {
      if (res.data?.success && res.data.data) setFiltered(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filters, categories])

  return (
    <div className={styles.page}>
      <ShowcaseBanner products={filtered} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>SEARCH_INTEL</span>
            <input 
              className={styles.searchInput}
              placeholder="TYPE_HERE..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>CATEGORIES</span>
            <div className={styles.categoryTree}>
              <button
                className={`${styles.treeItem} ${filters.category === 'ALL' ? styles.treeItemActive : ''}`}
                onClick={() => setFilters(f => ({ ...f, category: 'ALL' }))}
              >
                {t('products.filter_all').toUpperCase()}
              </button>
              
              {categories.map(cat => (
                <CategoryTreeItem 
                  key={cat.id} 
                  category={cat} 
                  depth={0} 
                  activeCategory={filters.category} 
                  onSelect={(name) => setFilters(f => ({ ...f, category: name }))} 
                />
              ))}
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.resultsBar}>
            <span className={styles.resultCount}>RESULTS: {filtered.length} //</span>
            <select 
              className={styles.sortSelect}
              value={filters.sort}
              onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
            >
              <option value="default">DEFAULT_SORT</option>
              <option value="price_asc">PRICE_ASC</option>
              <option value="price_desc">PRICE_DESC</option>
            </select>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="tech-detail" style={{ padding: '100px 0', textAlign: 'center' }}>[LOADING_ENCRYPTED_DATA...]</div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BentoGrid products={filtered} onAddToCart={handleAddToCart} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <CartFly trigger={trigger} onComplete={handleComplete} />
    </div>
  )
}

/* ─── Components ────────────────────────────────────────────────────────────── */
function CategoryTreeItem({ 
  category, 
  depth, 
  activeCategory, 
  onSelect 
}: { 
  category: CategoryDTO
  depth: number
  activeCategory: string
  onSelect: (name: string) => void 
}) {
  const isActive = activeCategory === category.name
  const hasChildren = category.children && category.children.length > 0

  return (
    <div className={styles.treeNode}>
      <button
        className={`${styles.treeItem} ${isActive ? styles.treeItemActive : ''}`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        onClick={() => onSelect(category.name)}
      >
        {category.name}
      </button>
      {hasChildren && (
        <div className={styles.treeChildren}>
          {category.children!.map(child => (
            <CategoryTreeItem 
              key={child.id} 
              category={child} 
              depth={depth + 1} 
              activeCategory={activeCategory} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
