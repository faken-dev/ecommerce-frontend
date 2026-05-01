import React, { useState, useEffect } from 'react';
import { cmsApi, type BannerDTO } from '../../api/cmsApi';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroBanner.module.css';

export const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    cmsApi.getActiveBanners().then(res => {
      if (res.data?.success) setBanners(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return (
    <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
            <h2>Chào mừng đến với Ecommerce</h2>
            <p>Khám phá những sản phẩm mới nhất hôm nay</p>
        </div>
    </div>
  );

  const banner = banners[current];

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={banner.id}
          className={styles.slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={banner.imageUrl} alt={banner.title} className={styles.image} />
          <div className={styles.overlay}>
            <motion.div 
              className={styles.content}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className={styles.title}>{banner.title}</h2>
              {banner.linkUrl && (
                <a href={banner.linkUrl} className={styles.btn}>Khám phá ngay</a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((_, i) => (
            <button 
              key={i} 
              className={i === current ? styles.activeDot : styles.dot}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
