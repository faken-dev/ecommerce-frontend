import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { useToast } from '../../hooks/useToast';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import styles from './WishlistPage.module.css';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export const WishlistPage: React.FC = () => {
  const { items, isLoading: loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { add: addToast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromWishlist(productId);
      addToast({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (err) {
      addToast({ type: 'error', message: 'Lỗi khi xóa sản phẩm' });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Danh sách yêu thích</h1>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.wishlistCard} style={{ height: 350, backgroundColor: 'var(--bg-secondary)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <Link to="/" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={24} /></Link>
           <h1 className={styles.title}>Sản phẩm yêu thích</h1>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {items.length} sản phẩm
        </span>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart className={styles.emptyIcon} size={64} strokeWidth={1} color="var(--text-secondary)" />
          <p className={styles.emptyText}>Danh sách yêu thích của bạn đang trống.</p>
          <Link to="/products" className={styles.shopNow}>
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <Link key={item.productId} to={`/products/${item.slug}`} className={styles.wishlistCard}>
              <button 
                className={styles.removeBtn} 
                onClick={(e) => handleRemove(e, item.productId)}
                title="Xóa khỏi yêu thích"
              >
                <Trash2 size={18} />
              </button>
              
              <div className={styles.imageContainer}>
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=300&auto=format&fit=crop'} 
                  alt={item.name}
                  className={styles.image}
                />
              </div>
              
              <div className={styles.info}>
                <h3 className={styles.productName}>
                  {item.name}
                </h3>
                <div className={styles.footer}>
                  <span className={styles.price}>
                    {currencyFormatter.format(item.price)}
                  </span>
                  <div className={styles.cartIcon}>
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
