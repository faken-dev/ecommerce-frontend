import { useEffect, useState } from 'react'
import { cmsApi, type StaticPageDTO } from '../../api/cmsApi'
import styles from './LegalPage.module.css'

interface Props {
  slug: string
  defaultTitle: string
}

export function DynamicLegalPage({ slug, defaultTitle }: Props) {
  const [page, setPage] = useState<StaticPageDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cmsApi.getPageBySlug(slug)
      .then(res => {
        if (res.data?.success) setPage(res.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className={styles.page} style={{ textAlign: 'center', padding: '5rem' }}>Đang tải...</div>

  if (!page) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>{defaultTitle}</h1>
          </header>
          <div className={styles.content}>
            <p>Nội dung đang được cập nhật...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{page.title}</h1>
          <p className={styles.updateDate}>Cập nhật lần cuối: {new Date(page.updatedAt).toLocaleDateString('vi-VN')}</p>
        </header>

        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        <footer className={styles.footer}>
          &copy; {new Date().getFullYear()} Store Platform. Bảo lưu mọi quyền.
        </footer>
      </div>
    </div>
  )
}
