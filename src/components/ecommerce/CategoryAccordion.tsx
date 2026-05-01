import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Icon } from '../common/Icon'
import styles from './CategoryAccordion.module.css'

interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
}

interface CategoryAccordionProps {
  categories: CategoryNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const CategoryItem: React.FC<{ 
  node: CategoryNode, 
  depth: number, 
  selectedId: string | null, 
  onSelect: (id: string | null) => void 
}> = ({ node, depth, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div className={styles.itemWrapper}>
      <div 
        className={`${styles.item} ${isSelected ? styles.itemActive : ''}`}
        style={{ paddingLeft: `${16 + depth * 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren && (
          <button 
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            <motion.div animate={{ rotate: isExpanded ? 0 : -90 }}>
              <Icon.ChevronDown size={14} />
            </motion.div>
          </button>
        )}
        {!hasChildren && <div className={styles.dot} />}
        <span className={styles.label}>{node.name}</span>
      </div>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.children}
          >
            {node.children!.map(child => (
              <CategoryItem 
                key={child.id} 
                node={child} 
                depth={depth + 1} 
                selectedId={selectedId} 
                onSelect={onSelect} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ categories, selectedId, onSelect }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.accordion}>
      <div 
        className={`${styles.item} ${!selectedId ? styles.itemActive : ''}`}
        onClick={() => onSelect(null)}
      >
        <div className={styles.dot} />
        <span className={styles.label}>{t('search.filters.all_categories')}</span>
      </div>
      {categories.map(cat => (
        <CategoryItem 
          key={cat.id} 
          node={cat} 
          depth={0} 
          selectedId={selectedId} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  )
}
