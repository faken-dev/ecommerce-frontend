import { useEffect } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import styles from './AdminSettingsPage.module.css'

export function AdminSettingsPage() {
  const { settings, updateSetting, setModuleExport, fetchSettings, loading } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải cấu hình...</div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cấu hình Hệ thống</h1>
        <p className={styles.sub}>Quản lý tính năng và các module mở rộng</p>
      </header>

      <div className={styles.grid}>
        {/* Module Toggles */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Tính năng mở rộng</h2>
          <div className={styles.list}>
            <div className={styles.item}>
              <div>
                <div className={styles.itemLabel}>Hệ thống Kho hàng (WMS)</div>
                <div className={styles.itemDesc}>Kích hoạt quản lý kho chi tiết (Vùng, Kệ, Tủ) cho Seller</div>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.warehousingEnabled} 
                  onChange={(e) => updateSetting('warehousingEnabled', e.target.checked)} 
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>
        </section>

        {/* Export Toggles */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Xuất dữ liệu (Export)</h2>
          <div className={styles.list}>
             <div className={styles.item}>
              <span>Xuất PDF</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.pdfExportEnabled} 
                  onChange={(e) => updateSetting('pdfExportEnabled', e.target.checked)} 
                />
                <span className={styles.slider} />
              </label>
            </div>
            <div className={styles.item}>
              <span>Xuất Excel</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.excelExportEnabled} 
                  onChange={(e) => updateSetting('excelExportEnabled', e.target.checked)} 
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          <div className={styles.divider} />
          
          <h3 className={styles.subTitle}>Phạm vi áp dụng Export</h3>
          <div className={styles.list}>
            {(['product', 'user', 'order'] as const).map(mod => (
              <div key={mod} className={styles.item}>
                <span style={{ textTransform: 'capitalize' }}>Module {mod}</span>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.moduleExports[mod]} 
                    onChange={(e) => setModuleExport(mod, e.target.checked)} 
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
