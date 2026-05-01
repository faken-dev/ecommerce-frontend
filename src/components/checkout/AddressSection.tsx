import { Icon } from '../common/Icon'
import type { Address } from '../../types'
import styles from '../../pages/buyer/CheckoutPage.module.css'

interface AddressSectionProps {
  addresses: Address[]
  selectedId: string
  onSelect: (id: string) => void
  onAddAddress: () => void
}

export function AddressSection({ addresses, selectedId, onSelect, onAddAddress }: AddressSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}><Icon.MapPin size={24} /> Địa chỉ giao hàng</h2>
      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className={styles.emptyAddress}>
            <p>Chưa có địa chỉ giao hàng.</p>
            <button onClick={onAddAddress} className={styles.addBtn}>+ Thêm địa chỉ mới</button>
          </div>
        ) : (
          addresses.map(addr => (
            <div 
              key={addr.id} 
              className={`${styles.addressItem} ${selectedId === addr.id ? styles.addressSelected : ''}`}
              onClick={() => onSelect(addr.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{addr.recipientName}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{addr.recipientPhone}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                  {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                </div>
              </div>
              {selectedId === addr.id && <Icon.Zap size={20} color="var(--accent-primary)" />}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
