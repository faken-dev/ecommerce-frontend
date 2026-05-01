import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { catalogApi, type ProductSummaryDTO } from '../../api/catalogApi';
import { ProductCard } from '../../components/ecommerce/ProductCard';
import { FilterSidebar } from '../../components/ecommerce/FilterSidebar';
import styles from './SearchPage.module.css';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [query, filters, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await catalogApi.search({
        q: query,
        sortBy: sortBy,
        size: 12,
        ...filters
      });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>
            {query ? `${t('search.title')} "${query}"` : t('search.all_products')}
          </h1>
          <div className={styles.controls}>
            <span className={styles.count}>{products.length} {t('search.count_label')}</span>
            <select 
              className={styles.sortSelect} 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t('search.sort.newest')}</option>
              <option value="price_asc">{t('search.sort.price_asc')}</option>
              <option value="price_desc">{t('search.sort.price_desc')}</option>
              <option value="rating">{t('search.sort.rating')}</option>
            </select>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <FilterSidebar onFilterChange={handleFilterChange} />
        
        <main className={styles.main}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>{t('search.loading')}</span>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h2>{t('search.empty_title')}</h2>
              <p>{t('search.empty_desc')}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
