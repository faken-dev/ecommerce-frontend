import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../common/Icon'
import styles from './CategorySelect.module.css'

interface CategoryDTO {
  id: string
  name: string
  children?: CategoryDTO[]
}

interface CategorySelectProps {
  categories: CategoryDTO[]
  value: string | null
  onChange: (id: string) => void
  placeholder?: string
}

const CategoryTreeNode: React.FC<{
  node: CategoryDTO
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  onExpand?: (id: string) => void
}> = ({ node, depth, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  
  const handleNodeClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    } else {
      onSelect(node.id)
    }
  }

  return (
    <div className={styles.nodeWrapper}>
      <div 
        className={`${styles.node} ${isSelected ? styles.nodeSelected : ''} ${hasChildren ? styles.nodeParent : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleNodeClick}
      >
        {hasChildren && (
          <div className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
            <Icon.ChevronRight size={14} />
          </div>
        )}
        {!hasChildren && <div className={styles.leafDot} />}
        <span className={styles.nodeName}>{node.name}</span>
        
        {hasChildren && (
          <button 
            type="button"
            className={styles.selectParentBtn}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(node.id)
            }}
          >
            Chọn
          </button>
        )}

        {isSelected && <Icon.ShoppingCart size={14} className={styles.checkIcon} />}
      </div>
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.childrenContainer}
          >
            {node.children!.map(child => (
              <CategoryTreeNode 
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

export function CategorySelect({ categories, value, onChange, placeholder = 'Chọn danh mục...' }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Find selected category name
  const findCategoryName = (nodes: CategoryDTO[], id: string): string | null => {
    for (const node of nodes) {
      if (node.id === id) return node.name
      if (node.children) {
        const found = findCategoryName(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedName = value ? findCategoryName(categories, value) : null

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter categories for search
  const filterCategories = (nodes: CategoryDTO[], term: string): CategoryDTO[] => {
    if (!term) return nodes
    return nodes.reduce((acc: CategoryDTO[], node) => {
      const matches = node.name.toLowerCase().includes(term.toLowerCase())
      const filteredChildren = node.children ? filterCategories(node.children, term) : []
      
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
      return acc
    }, [])
  }

  const filteredCategories = filterCategories(categories, search)

  return (
    <div className={styles.container} ref={containerRef}>
      <div 
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedName ? styles.value : styles.placeholder}>
          {selectedName || placeholder}
        </span>
        <Icon.ChevronDown size={16} className={styles.arrow} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.dropdown}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <div className={styles.searchWrapper}>
              <Icon.Search size={14} className={styles.searchIcon} />
              <input 
                className={styles.searchInput}
                placeholder="Tìm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            
            <div className={styles.treeWrapper}>
              {filteredCategories.length === 0 ? (
                <div className={styles.noResults}>Không tìm thấy danh mục</div>
              ) : (
                filteredCategories.map(cat => (
                  <CategoryTreeNode 
                    key={cat.id} 
                    node={cat} 
                    depth={0} 
                    selectedId={value} 
                    onSelect={(id) => {
                      onChange(id)
                      setIsOpen(false)
                    }}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
