import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

// ─── Types mirroring backend ─────────────────────────────────────────────────

export interface CategoryDTO {
  id: string
  slug: string
  name: string
  description?: string
  iconUrl?: string
  parentId?: string
  sortOrder: number
  children?: CategoryDTO[]
  productCount?: number
}

export interface ProductSummaryDTO {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  sku?: string
  imageUrl?: string
  threeDModelUrl?: string
  categoryId?: string
  categoryName?: string
  sellerId: string
  sellerName?: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DELETED'
  tags?: string[]
  isFeatured: boolean
  averageRating: number
  reviewCount: number
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export interface ProductDetailDTO extends ProductSummaryDTO {
  description: string
  descriptionHtml?: string
  costPerItem?: number
  barcode?: string
  weightKg?: number
  weightUnit?: string
  metaTitle?: string
  metaDescription?: string
  images: ProductImageDTO[]
  variants?: ProductVariantDTO[]
  totalSold?: number
  averageRating: number
  reviewCount: number
}

export interface ProductImageDTO {
  id: string
  url: string
  altText?: string
  sortOrder: number
}

export interface ProductVariantDTO {
  id: string
  title: string
  sku?: string
  barcode?: string
  price: number
  compareAtPrice?: number
  optionName: string
  optionValue: string
  option2Name?: string
  option2Value?: string
  imageUrl?: string
  active: boolean
}

// Pagination metadata is now part of the generic ApiResponse interface.
// Methods returning multiple items will have data: ProductSummaryDTO[] and use response.page for metadata.

// ─── API ────────────────────────────────────────────────────────────────────

export const catalogApi = {
  // Categories
  getCategoryTree: () =>
    axiosClient.get<ApiResponse<CategoryDTO[]>>('/categories/tree'),

  // Products — public
  listPublic: (page = 0, size = 20) =>
    axiosClient.get<ApiResponse<ProductSummaryDTO[]>>('/products/public', {
      params: { page, size },
    }),

  search: (params: {
    q?: string,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    inStock?: boolean,
    sortBy?: string,
    page?: number,
    size?: number
  }) =>
    axiosClient.get<ApiResponse<ProductSummaryDTO[]>>('/products/public/search', {
      params,
    }),

  getSuggestions: (q: string) =>
    axiosClient.get<ApiResponse<String[]>>('/products/public/suggestions', {
      params: { q },
    }),

  byCategory: (categoryId: string, page = 0, size = 20) =>
    axiosClient.get<ApiResponse<ProductSummaryDTO[]>>(
      `/products/public/category/${categoryId}`,
      { params: { page, size } },
    ),

  getPublic: (productId: string) =>
    axiosClient.get<ApiResponse<ProductDetailDTO>>(`/products/public/${productId}`),

  // Products — seller/admin
  listAllAdmin: (page = 0, size = 20) =>
    axiosClient.get<ApiResponse<ProductSummaryDTO[]>>('/products/admin', {
      params: { page, size },
    }),

  getMyProducts: (page = 0, size = 20) =>
    axiosClient.get<ApiResponse<ProductSummaryDTO[]>>('/products/me', {
      params: { page, size },
    }),

  get: (productId: string) =>
    axiosClient.get<ApiResponse<ProductDetailDTO>>(`/products/${productId}`),

  create: (payload: unknown) =>
    axiosClient.post<ApiResponse<ProductDetailDTO>>('/products', payload),

  update: (productId: string, payload: unknown) =>
    axiosClient.put<ApiResponse<ProductDetailDTO>>(`/products/${productId}`, payload),

  delete: (productId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/products/${productId}`),

  activate: (productId: string) =>
    axiosClient.post<ApiResponse<ProductDetailDTO>>(`/products/${productId}/activate`),

  // Categories — admin
  createCategory: (payload: unknown) =>
    axiosClient.post<ApiResponse<CategoryDTO>>('/categories', payload),

  updateCategory: (id: string, payload: unknown) =>
    axiosClient.put<ApiResponse<CategoryDTO>>(`/categories/${id}`, payload),

  deleteCategory: (id: string) =>
    axiosClient.delete<ApiResponse<null>>(`/categories/${id}`),
}
