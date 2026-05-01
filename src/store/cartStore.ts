import { create } from 'zustand'
import { cartApi, type CartDTO } from '../api/cartApi'

interface CartState {
  cart: CartDTO | null
  loading: boolean
  error: string | null
  
  fetchCart: () => Promise<void>
  addItem: (productId: string, variantId: string | undefined, quantity: number, unitPrice: number) => Promise<void>
  updateItem: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>
  removeItem: (productId: string, variantId?: string) => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const res = await cartApi.getCart()
      if (res.data?.success) {
        set({ cart: res.data.data })
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch cart' })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, variantId, quantity, unitPrice) => {
    try {
      const res = await cartApi.addItem({ productId, variantId, quantity, unitPrice })
      if (res.data?.success) {
        set({ cart: res.data.data })
      }
    } catch (err: any) {
      console.error('Failed to add to cart:', err)
      // Throw so components can handle it (e.g. show toast)
      throw err
    }
  },

  updateItem: async (productId, variantId, quantity) => {
    try {
      const res = await cartApi.updateItem({ productId, variantId, quantity })
      if (res.data?.success) {
        set({ cart: res.data.data })
      }
    } catch (err: any) {
      console.error('Failed to update cart item:', err)
      throw err
    }
  },

  removeItem: async (productId, variantId) => {
    try {
      await cartApi.removeItem(productId, variantId)
      // Refresh cart or filter out locally
      await get().fetchCart()
    } catch (err: any) {
      console.error('Failed to remove cart item:', err)
      throw err
    }
  }
}))
