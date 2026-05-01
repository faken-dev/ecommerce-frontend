import { useState, useEffect } from 'react'
import { inventoryApi, type WarehouseDTO } from '../../api/inventoryApi'
import { useToast } from '../../hooks/useToast'
import { Icon } from '../../components/common/Icon'
import { Badge } from '../../components/admin/AdminUI'
import styles from '../admin/AdminInventoryPage.module.css'

export function SellerWarehousePage() {
  const { add: addToast } = useToast()
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWarehouse, setNewWarehouse] = useState({ name: '', address: '', active: true })
  
  // Structure states
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDTO | null>(null)
  const [structure, setStructure] = useState<any[]>([])
  const [loadingStructure, setLoadingStructure] = useState(false)
  const [showAddZone, setShowAddZone] = useState(false)
  const [newZone, setNewZone] = useState({ name: '', description: '' })
  const [showAddSlot, setShowAddSlot] = useState<string | null>(null) // zoneId
  const [newSlot, setNewSlot] = useState({ name: '', capacity: 100 })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    if (selectedWarehouse) {
      fetchStructure(selectedWarehouse.id)
    }
  }, [selectedWarehouse])

  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.getWarehouses()
      if (res.data?.success) {
        setWarehouses(res.data.data)
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể tải danh sách kho' })
    } finally {
      setLoading(false)
    }
  }

  const fetchStructure = async (warehouseId: string) => {
    setLoadingStructure(true)
    try {
      const res = await inventoryApi.getStructure(warehouseId)
      if (res.data?.success) {
        setStructure(res.data.data)
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể tải cấu trúc kho' })
    } finally {
      setLoadingStructure(false)
    }
  }

  const handleAddWarehouse = async () => {
    if (!newWarehouse.name) return
    try {
      const res = await inventoryApi.createWarehouse(newWarehouse)
      if (res.data?.success) {
        setWarehouses(prev => [...prev, res.data.data])
        setShowAddModal(false)
        setNewWarehouse({ name: '', address: '', active: true })
        addToast({ type: 'success', message: 'Thêm kho thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể tạo kho mới' })
    }
  }

  const handleAddZone = async () => {
    if (!selectedWarehouse || !newZone.name) return
    try {
      const res = await inventoryApi.addZone(selectedWarehouse.id, newZone.name, newZone.description)
      if (res.data?.success) {
        fetchStructure(selectedWarehouse.id)
        setShowAddZone(false)
        setNewZone({ name: '', description: '' })
        addToast({ type: 'success', message: 'Thêm khu vực thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể thêm khu vực' })
    }
  }

  const handleAddSlot = async (zoneId: string) => {
    if (!newSlot.name) return
    try {
      const res = await inventoryApi.addSlot(zoneId, newSlot.name, newSlot.capacity)
      if (res.data?.success) {
        if (selectedWarehouse) fetchStructure(selectedWarehouse.id)
        setShowAddSlot(null)
        setNewSlot({ name: '', capacity: 100 })
        addToast({ type: 'success', message: 'Thêm vị trí thành công' })
      }
    } catch {
      addToast({ type: 'error', message: 'Không thể thêm vị trí' })
    }
  }

  if (selectedWarehouse) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
           <button className={styles.backBtn} onClick={() => setSelectedWarehouse(null)}>
              <Icon.ArrowLeft size={20} />
           </button>
           <div>
              <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem' }}>{selectedWarehouse.name}</h1>
              <p className={styles.pageSub}>Thiết lập sơ đồ khu vực và kệ hàng vật lý</p>
           </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <button className={styles.adjustBtn} onClick={() => setShowAddZone(true)}>
             <Icon.Plus size={18} /> Thêm khu vực lưu trữ
          </button>
        </div>

        {loadingStructure ? <div className={styles.loading}>Đang tải sơ đồ kho...</div> : structure.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)' }}>
             <Icon.Box size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
             <h3 style={{ fontSize: '1.25rem' }}>Kho chưa có phân khu</h3>
             <p className={styles.pageSub}>Bắt đầu bằng cách chia nhỏ kho thành các Zone để dễ dàng quản lý vị trí.</p>
             <button className={styles.adjustBtn} style={{ marginTop: 24, margin: '0 auto' }} onClick={() => setShowAddZone(true)}>+ Tạo Zone đầu tiên</button>
          </div>
        ) : (
          <div className={styles.zoneGrid}>
             {structure.map(zone => (
               <div key={zone.id} className={styles.zoneCard}>
                  <div className={styles.zoneHeader}>
                     <div>
                        <h3 className={styles.zoneTitle}>{zone.name}</h3>
                        <div className={styles.zoneDesc}>{zone.description || 'Khu vực lưu trữ tiêu chuẩn'}</div>
                     </div>
                     <button className={styles.actionBtn} onClick={() => setShowAddSlot(zone.id)} title="Thêm kệ">
                        <Icon.Plus size={18} />
                     </button>
                  </div>
                  <div className={styles.slotGrid}>
                     {zone.slots?.map((slot: any) => (
                       <div key={slot.id} className={styles.slotItem}>
                          <div className={styles.slotName}>{slot.name}</div>
                          <div className={styles.slotCap}>{slot.capacity} SP</div>
                       </div>
                     ))}
                     <button className={styles.addSlotBtn} onClick={() => setShowAddSlot(zone.id)}>
                        <Icon.Plus size={20} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* Modals... */}
        {showAddZone && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
             <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 }}>
                <h2 style={{ marginBottom: 24, fontSize: '1.5rem' }}>Thêm khu vực mới</h2>
                <div style={{ marginBottom: 16 }}>
                  <label className={styles.label}>Tên khu vực</label>
                  <input className={styles.input} value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} placeholder="vd: Khu A, Tầng 1..." />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className={styles.label}>Mô tả (tùy chọn)</label>
                  <textarea className={styles.input} style={{ minHeight: 80 }} value={newZone.description} onChange={e => setNewZone({ ...newZone, description: e.target.value })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button className={styles.adjustBtn} onClick={() => setShowAddZone(false)}>Hủy</button>
                  <button className={styles.adjustBtn} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }} onClick={handleAddZone} disabled={!newZone.name}>Xác nhận</button>
                </div>
             </div>
          </div>
        )}

        {showAddSlot && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
             <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 }}>
                <h2 style={{ marginBottom: 24, fontSize: '1.5rem' }}>Thêm vị trí kệ</h2>
                <div style={{ marginBottom: 16 }}>
                  <label className={styles.label}>Mã vị trí / Tên kệ</label>
                  <input className={styles.input} value={newSlot.name} onChange={e => setNewSlot({ ...newSlot, name: e.target.value })} placeholder="vd: A-01-01" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className={styles.label}>Sức chứa (Capacity)</label>
                  <input type="number" className={styles.input} value={newSlot.capacity} onChange={e => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button className={styles.adjustBtn} onClick={() => setShowAddSlot(null)}>Hủy</button>
                  <button className={styles.adjustBtn} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }} onClick={() => handleAddSlot(showAddSlot)} disabled={!newSlot.name}>Hoàn tất</button>
                </div>
             </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Kho (WMS)</h1>
          <p className={styles.pageSub}>Thiết lập và quản lý hạ tầng lưu trữ vật lý của bạn</p>
        </div>
        <button className={styles.adjustBtn} onClick={() => setShowAddModal(true)}>
          <Icon.Plus size={18} /> Đăng ký kho hàng
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên kho hàng</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={styles.loading}>Đang tải danh sách kho...</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan={5} className={styles.loading}>Bạn chưa có kho hàng nào. Hãy đăng ký ngay!</td></tr>
              ) : warehouses.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 800, fontSize: '1rem' }}>{w.name}</td>
                  <td>{w.address || 'Chưa cập nhật địa chỉ'}</td>
                  <td>
                    <Badge type={w.active ? 'success' : 'neutral'}>
                      {w.active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                       <button className={styles.adjustBtn} onClick={() => setSelectedWarehouse(w)}>
                          <Icon.Settings size={16} /> Thiết lập sơ đồ
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 450 }}>
            <h2 style={{ marginBottom: 24, fontSize: '1.5rem' }}>Đăng ký kho mới</h2>
            <div style={{ marginBottom: 16 }}>
              <label className={styles.label}>Tên kho hàng</label>
              <input className={styles.input} value={newWarehouse.name} onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })} placeholder="vd: Kho Trung Chuyển HCM" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className={styles.label}>Địa chỉ vật lý</label>
              <textarea className={styles.input} style={{ minHeight: 80 }} value={newWarehouse.address} onChange={e => setNewWarehouse({ ...newWarehouse, address: e.target.value })} placeholder="Số 123, đường..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className={styles.adjustBtn} onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className={styles.adjustBtn} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }} onClick={handleAddWarehouse} disabled={!newWarehouse.name}>Đăng ký ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
