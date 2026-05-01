import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '../../api/catalogApi';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SearchBar.module.css';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await catalogApi.getSuggestions(query);
      if (response.data.success) {
        setSuggestions(response.data.data as unknown as string[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent, searchTerms?: string) => {
    e?.preventDefault();
    const finalQuery = searchTerms || query;
    if (finalQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
    }
  };

  return (
    <div className={styles.wrapper} ref={searchRef}>
      <form className={styles.searchBox} onSubmit={(e) => handleSearch(e)}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className={styles.input}
        />
        <button type="submit" className={styles.searchBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={styles.dropdown}
          >
            {isLoading ? (
              <div className={styles.loading}>Đang tìm gợi ý...</div>
            ) : (
              suggestions.map((item, idx) => (
                <div 
                  key={idx} 
                  className={styles.suggestionItem}
                  onClick={() => handleSearch(undefined, item)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>{item}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
