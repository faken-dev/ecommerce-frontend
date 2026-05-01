import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import feedbackApi from '../../api/feedbackApi';
import { RatingSummary } from './RatingSummary';
import { useToast } from '../../hooks/useToast';
import type { ReviewDTO, RatingSummaryDTO } from '../../types';
import styles from './ReviewSection.module.css';

interface ReviewSectionProps {
  productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [summary, setSummary] = useState<RatingSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
    loadSummary();
  }, [productId]);

  const loadSummary = async () => {
    try {
      const response = await feedbackApi.getRatingSummary(productId);
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load rating summary', error);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await feedbackApi.getProductReviews(productId);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đánh giá sản phẩm</h2>
        {isAuthenticated && (
          <button className={styles.writeBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Hủy' : 'Viết đánh giá'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.formWrap}
          >
            <ReviewForm productId={productId} onSuccess={() => {
              setShowForm(false);
              loadReviews();
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {summary && <RatingSummary summary={summary} />}

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>Chưa có đánh giá nào cho sản phẩm này.</div>
        ) : (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

const ReviewForm: React.FC<{ productId: string, onSuccess: () => void }> = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { add } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { hasProfanity } = await import('../../lib/profanityFilter');
    if (hasProfanity(content)) {
      add({ type: 'error', message: 'Đánh giá của bạn chứa từ ngữ không phù hợp. Vui lòng điều chỉnh lại nội dung.' });
      return;
    }

    setSubmitting(true);
    try {
      await feedbackApi.postReview({
        productId,
        rating,
        content,
        images: [] // Future: handle image uploads
      });
      onSuccess();
    } catch (error: any) {
      add({ type: 'error', message: error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.ratingSelect}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button 
            key={s} 
            type="button" 
            onClick={() => setRating(s)}
            className={s <= rating ? styles.starActive : styles.star}
          >
            ★
          </button>
        ))}
      </div>
      <textarea 
        className={styles.textarea}
        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button className={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
};

const ReviewItem: React.FC<{ review: ReviewDTO }> = ({ review }) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <div className={styles.userAvatar}>
          {review.userName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{review.userName}</p>
          <div className={styles.stars}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
        </div>
        <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p className={styles.content}>{review.content}</p>
      {review.images && review.images.length > 0 && (
        <div className={styles.images}>
          {review.images.map((img, idx) => (
            <img key={idx} src={img} alt="review" className={styles.reviewImg} />
          ))}
        </div>
      )}
      
      {review.comments && review.comments.length > 0 && (
        <div className={styles.comments}>
          {review.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <p className={styles.commentUser}>{comment.userName}</p>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
