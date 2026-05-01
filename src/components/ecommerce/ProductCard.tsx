import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { ProductSummaryDTO } from '../../api/catalogApi';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import styles from './ProductCard.module.css';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=300&auto=format&fit=crop';

interface ProductCardProps {
  product: ProductSummaryDTO;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const rating = Math.round(product.averageRating || 0);
  const { isAuthenticated } = useAuthStore();
  const { add: addToast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      return addToast({ type: 'warning', message: 'Vui lòng đăng nhập để lưu sản phẩm' });
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        addToast({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích' });
      } else {
        await addToWishlist(product.id);
        addToast({ type: 'success', message: 'Đã thêm vào danh sách yêu thích' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Không thể thực hiện thao tác' });
    }
  };

  return (
    <div className={styles.cardWrapper} style={{ position: 'relative' }}>
      <button 
        className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
        onClick={toggleWishlist}
        title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
      
      <Link to={`/products/${product.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          <img 
            src={product.imageUrl || PLACEHOLDER_IMAGE} 
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== PLACEHOLDER_IMAGE) {
                target.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
          {product.isFeatured && <span className={styles.featured}>Nổi bật</span>}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name} title={product.name}>{product.name}</h3>
          <div className={styles.rating}>
            <span className={styles.stars}>
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
            {product.reviewCount > 0 && (
              <span className={styles.count}>({product.reviewCount})</span>
            )}
          </div>
          <div className={styles.footer}>
            <span className={styles.price}>
              {currencyFormatter.format(product.price)}
            </span>
            <span className={styles.sold}>
              FREE SHIP
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
