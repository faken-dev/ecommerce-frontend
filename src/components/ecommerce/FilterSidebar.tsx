import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { catalogApi, type CategoryDTO } from '../../api/catalogApi';
import { CategoryAccordion } from './CategoryAccordion';
import styles from './FilterSidebar.module.css';

export interface FilterState {
  categoryId: string | null;
  minPrice: number;
  maxPrice: number;
  minRating: number | null;
  inStock: boolean;
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    catalogApi.getCategoryTree()
      .then(res => {
        if (mounted) {
          if (res.data.success) setCategories(res.data.data);
          else setError(t('search.loading_error'));
        }
      })
      .catch(() => mounted && setError(t('search.connection_error')))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleApply = () => {
    onFilterChange({
      categoryId: selectedCategory,
      minPrice: priceRange.min === '' ? 0 : Number(priceRange.min),
      maxPrice: priceRange.max === '' ? 100000000 : Number(priceRange.max),
      minRating: minRating,
      inStock: inStock
    });
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setPriceRange({ min: '', max: '' });
    setMinRating(null);
    setInStock(false);
    onFilterChange({
      categoryId: null,
      minPrice: 0,
      maxPrice: 100000000,
      minRating: null,
      inStock: false
    });
  };

  if (loading) return <div className={styles.sidebarPlaceholder}>Đang tải...</div>;
  if (error) return <div className={styles.sidebarError}>{error}</div>;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.mainTitle}>{t('search.filters.title')}</h2>
        <button className={styles.resetBtn} onClick={handleReset}>{t('search.filters.reset')}</button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>{t('search.filters.category')}</h3>
        <CategoryAccordion 
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>{t('search.filters.price_range')}</h3>
        <div className={styles.priceInputs}>
          <input 
            type="number" 
            placeholder={t('search.filters.price_from')} 
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
          />
          <span className={styles.divider}>-</span>
          <input 
            type="number" 
            placeholder={t('search.filters.price_to')} 
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>{t('search.filters.rating')}</h3>
        {[5, 4, 3, 2, 1].map(star => (
          <label key={star} className={styles.ratingLabel}>
            <input 
              type="radio" 
              name="rating" 
              checked={minRating === star}
              onChange={() => setMinRating(star)}
            />
            <span className={styles.stars}>{'★'.repeat(star)}{'☆'.repeat(5-star)}</span>
            <span className={styles.starText}>{t('search.filters.rating_up')}</span>
          </label>
        ))}
      </div>

      <div className={styles.section}>
        <label className={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          <span>{t('search.filters.in_stock')}</span>
        </label>
      </div>

      <button className={styles.applyBtn} onClick={handleApply}>
        {t('search.filters.apply')}
      </button>
    </div>
  );
};
