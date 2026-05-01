import { Icon } from '../common/Icon'
import styles from '../../pages/buyer/CheckoutPage.module.css'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

interface CheckoutItemListProps {
  items: any[]
}

export function CheckoutItemList({ items }: CheckoutItemListProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}><Icon.Package size={24} /> Sản phẩm ({items.length})</h2>
      <div className={styles.itemList}>
        {items.map(item => (
          <div key={item.id} className={styles.productItem}>
            <img src={item.productImageUrl || 'https://placehold.co/100'} alt={item.productName} className={styles.productImage} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{item.productName}</div>
              {item.variantTitle && <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Phân loại: {item.variantTitle}</div>}
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
                {fmt(item.unitPrice)} x {item.quantity}
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{fmt(item.lineTotal)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
