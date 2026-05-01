import { useSettingsStore } from '../../store/settingsStore'
import { exportToExcel, exportToPDF } from '../../lib/exportUtils'
import { Icon } from '../common/Icon'
import styles from './ExportButtons.module.css'

interface ExportButtonsProps {
  data: any[]
  fileName: string
  pdfTitle: string
  headers: string[]
  mapping: (item: any) => any[]
  module: 'product' | 'user' | 'order'
}

export function ExportButtons({ data, fileName, pdfTitle, headers, mapping, module }: ExportButtonsProps) {
  const { settings } = useSettingsStore()

  const handleExportPDF = () => {
    const tableData = data.map(mapping)
    exportToPDF(headers, tableData, fileName, pdfTitle)
  }

  const handleExportExcel = () => {
    const tableData = data.map(mapping).map(row => {
      const obj: any = {}
      headers.forEach((h, i) => obj[h] = row[i])
      return obj
    })
    exportToExcel(tableData, fileName)
  }

  // Check if global export is enabled AND module export is enabled
  const isEnabled = (settings.pdfExportEnabled || settings.excelExportEnabled) && settings.moduleExports[module]

  if (!isEnabled) return null

  return (
    <div className={styles.container}>
      {settings.pdfExportEnabled && (
        <button className={styles.btn} onClick={handleExportPDF} title="Xuất PDF">
          <Icon.FileText size={16} />
          <span>PDF</span>
        </button>
      )}
      {settings.excelExportEnabled && (
        <button className={styles.btn} onClick={handleExportExcel} title="Xuất Excel">
          <Icon.File size={16} />
          <span>Excel</span>
        </button>
      )}
    </div>
  )
}
