import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title?: string
  message: string
}

interface ToastState {
  toasts: ToastData[]
  add: (toast: Omit<ToastData, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = uuid()
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
