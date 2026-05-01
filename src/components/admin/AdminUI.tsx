import React, { useState, useRef, useEffect } from 'react'
import styles from './AdminUI.module.css'
import { storageApi } from '../../api/storageApi'
import { Icon } from '../common/Icon'
import { useToast } from '../../hooks/useToast'

interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  extra?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, description, children, extra }) => (
  <div className={styles.card}>
    {(title || extra) && (
      <div className={styles.cardHeader}>
        <div>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {description && <p className={styles.cardDescription}>{description}</p>}
        </div>
        {extra && <div className={styles.cardExtra}>{extra}</div>}
      </div>
    )}
    <div className={styles.cardBody}>{children}</div>
  </div>
)

interface BadgeProps {
  children: React.ReactNode
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral', style }) => (
  <span className={`${styles.badge} ${styles[`badge_${type}`]}`} style={style}>
    {children}
  </span>
)

interface SeoPreviewProps {
  title: string
  description: string
  slug: string
}

export const SeoPreview: React.FC<SeoPreviewProps> = ({ title, description, slug }) => {
  const baseUrl = window.location.origin
  return (
    <div className={styles.seoPreview}>
      <div className={styles.seoUrl}>
        <Icon.Globe size={12} />
        {baseUrl}/products/{slug || 'your-slug'}
      </div>
      <div className={styles.seoTitle}>{title || 'Product Meta Title'}</div>
      <div className={styles.seoDescription}>
        {description || 'This is how your product will appear in search engine results. Write a compelling description to improve click-through rates.'}
      </div>
      <div className={styles.seoBadge}>Google Search</div>
    </div>
  )
}

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  shape?: 'square' | 'circle'
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, folder = 'general', shape = 'square' }) => {
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { add } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await storageApi.upload(file, folder)
      if (res.data?.success) {
        onChange(res.data.data.url)
      }
    } catch (err) {
      console.error(err)
      add({ type: 'error', message: 'Lỗi khi tải ảnh lên' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`${styles.imageUploadWrapper} ${shape === 'circle' ? styles.isCircle : ''}`}>
      {value ? (
        <div className={styles.imagePreviewContainer}>
          <img src={value} alt="Preview" className={styles.imagePreview} />
          <div className={styles.imageOverlay}>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.overlayBtn} title="Thay đổi">
              <Icon.Edit size={16} />
            </button>
            <button type="button" onClick={() => onChange('')} className={styles.overlayBtnDanger} title="Xóa">
              <Icon.Trash size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" disabled={uploading} />
          {uploading ? (
            <div className={styles.uploadingState}>
               <div className={styles.spinner} />
               <span>Đang tải...</span>
            </div>
          ) : (
            <>
              <div className={styles.uploadIconCircle}>
                <Icon.Image size={24} />
              </div>
              <div className={styles.uploadTextContainer}>
                <span className={styles.uploadTitle}>Tải ảnh lên</span>
                <span className={styles.uploadSub}>PNG, JPG hoặc WebP</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface TreeSelectProps {
  options: { id: string, name: string, level: number }[]
  value?: string
  onChange: (id: string | undefined) => void
  placeholder?: string
  label?: string
}

export const TreeSelect: React.FC<TreeSelectProps> = ({ options, value, onChange, placeholder = 'Chọn...', label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.id === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={styles.treeSelectContainer} ref={containerRef}>
      {label && <label className={styles.treeSelectLabel}>{label}</label>}
      
      <div 
        className={`${styles.treeSelectTrigger} ${isOpen ? styles.isOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <Icon.ChevronDown size={16} className={styles.chevron} />
      </div>

      {isOpen && (
        <div className={styles.treeSelectDropdown}>
          <div className={styles.dropdownSearch}>
            <Icon.Search size={14} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className={styles.optionsList}>
            <div 
              className={`${styles.optionItem} ${!value ? styles.isSelected : ''}`}
              onClick={() => { onChange(undefined); setIsOpen(false); }}
            >
              <Icon.Globe size={14} style={{ opacity: 0.5 }} />
              (Không có - Danh mục gốc)
            </div>
            {filteredOptions.map(option => (
              <div 
                key={option.id}
                className={`${styles.optionItem} ${value === option.id ? styles.isSelected : ''}`}
                style={{ paddingLeft: 16 + (option.level * 20) }}
                onClick={() => { onChange(option.id); setIsOpen(false); }}
              >
                <div className={styles.levelIndicate}>
                  {option.level > 0 ? <Icon.ChevronRight size={12} /> : <Icon.Folder size={14} />}
                </div>
                {option.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
