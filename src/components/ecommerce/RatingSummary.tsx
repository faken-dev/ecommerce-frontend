import React from 'react';
import type { RatingSummaryDTO } from '../../types';
import styles from './RatingSummary.module.css';

interface RatingSummaryProps {
  summary: RatingSummaryDTO;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({ summary }) => {
  const { averageRating, totalReviews, ratingDistribution } = summary;

  return (
    <div className={styles.container}>
      <div className={styles.overall}>
        <div className={styles.average}>{averageRating.toFixed(1)}</div>
        <div className={styles.stars}>
          {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
        </div>
        <div className={styles.total}>{totalReviews} đánh giá</div>
      </div>

      <div className={styles.bars}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={star} className={styles.barItem}>
              <span className={styles.starNum}>{star} ★</span>
              <div className={styles.track}>
                <div 
                  className={styles.fill} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={styles.count}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
