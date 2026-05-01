import { create } from 'zustand'
import { wishlistApi, type WishlistItem } from '../api/wishlistApi'

interface WishlistState {
  items: WishlistItem[]
  wishlistedProductIds: Set<string>
  isLoading: boolean
  error: string | null
  
  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  wishlistedProductIds: new Set(),
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await wishlistApi.getWishlist()
      const items = Array.isArray(res.data) ? res.data : []
      const ids = new Set(items.map(item => item.productId))
      set({ items, wishlistedProductIds: ids, isLoading: false })
    } catch (err: any) {
      set({ error: 'Failed to fetch wishlist', isLoading: false })
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      await wishlistApi.addToWishlist(productId)
      // We don't have the full item details here, so we refresh the list
      // Or we could just add the ID to the set and wait for next fetch
      await get().fetchWishlist()
    } catch (err: any) {
      console.error('Failed to add to wishlist', err)
      throw err
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId)
      set(state => {
        const newIds = new Set(state.wishlistedProductIds)
        newIds.delete(productId)
        return {
          items: state.items.filter(item => item.productId !== productId),
          wishlistedProductIds: newIds
        }
      })
    } catch (err: any) {
      console.error('Failed to remove from wishlist', err)
      throw err
    }
  },

  isInWishlist: (productId: string) => {
    return get().wishlistedProductIds.has(productId)
  }
}))
