import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { systemApi } from '../api/systemApi'

interface SystemSettings {
  warehousingEnabled: boolean
  pdfExportEnabled: boolean
  excelExportEnabled: boolean
  moduleExports: {
    product: boolean
    user: boolean
    order: boolean
  }
}

interface SettingsState {
  settings: SystemSettings
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<void>
  setModuleExport: (module: keyof SystemSettings['moduleExports'], enabled: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        warehousingEnabled: false,
        pdfExportEnabled: true,
        excelExportEnabled: true,
        moduleExports: {
          product: true,
          user: false,
          order: true,
        },
      },
      loading: false,

      fetchSettings: async () => {
        set({ loading: true })
        try {
          const res = await systemApi.getSettings()
          if (res.data?.success && res.data.data) {
            const remote = res.data.data
            set((state) => ({
              settings: {
                ...state.settings,
                warehousingEnabled: remote['warehousingEnabled'] === 'true',
                pdfExportEnabled: remote['pdfExportEnabled'] === 'true',
                excelExportEnabled: remote['excelExportEnabled'] === 'true',
                moduleExports: {
                  product: remote['moduleExports.product'] === 'true',
                  user: remote['moduleExports.user'] === 'true',
                  order: remote['moduleExports.order'] === 'true',
                }
              }
            }))
          }
        } finally {
          set({ loading: false })
        }
      },

      updateSetting: async (key, value) => {
        const newSettings = { ...get().settings, [key]: value }
        set({ settings: newSettings })
        
        // Sync to backend
        try {
          await systemApi.updateSettings({ [key]: String(value) })
        } catch (err) {
          console.error('Failed to sync setting to backend', err)
        }
      },

      setModuleExport: async (module, enabled) => {
        const newModuleExports = { ...get().settings.moduleExports, [module]: enabled }
        set((state) => ({ 
          settings: { ...state.settings, moduleExports: newModuleExports } 
        }))

        // Sync to backend
        try {
          await systemApi.updateSettings({ [`moduleExports.${module}`]: String(enabled) })
        } catch (err) {
          console.error('Failed to sync module setting', err)
        }
      },
    }),
    { name: 'system-settings' }
  )
)
