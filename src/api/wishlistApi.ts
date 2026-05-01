import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface WishlistItem {
  productId: string
  name: string
  slug: string
  imageUrl: string
  price: number
  addedAt: string
}

export const wishlistApi = {
  getWishlist: () => 
    axiosClient.get<WishlistItem[]>('/wishlist'),
  
  addToWishlist: (productId: string) => 
    axiosClient.post<void>(`/wishlist/${productId}`),
  
  removeFromWishlist: (productId: string) => 
    axiosClient.delete<void>(`/wishlist/${productId}`)
}
