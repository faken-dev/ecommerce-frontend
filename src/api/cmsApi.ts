import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface BannerDTO {
  id: string
  imageUrl: string
  linkUrl?: string
  title?: string
  status: string
  priority: number
  createdAt: string
  updatedAt?: string
}

export interface SaveBannerRequest {
  id?: string
  imageUrl: string
  linkUrl?: string
  title?: string
  status?: string
  priority?: number
}

export interface StaticPageDTO {
  id: string
  title: string
  slug: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SaveStaticPageRequest {
  id?: string
  title: string
  slug: string
  content: string
  isActive?: boolean
}

export const cmsApi = {
  /**
   * Public: Get active banners for home page
   */
  getActiveBanners: () =>
    axiosClient.get<ApiResponse<BannerDTO[]>>('/public/banners'),

  /**
   * Admin: List all banners
   */
  getAllBanners: () =>
    axiosClient.get<ApiResponse<BannerDTO[]>>('/admin/cms/banners'),

  /**
   * Admin: Save (create/update) banner
   */
  saveBanner: (payload: SaveBannerRequest) =>
    axiosClient.post<ApiResponse<BannerDTO>>('/admin/cms/banners', payload),

  /**
   * Admin: Delete banner
   */
  deleteBanner: (id: string) =>
    axiosClient.delete<ApiResponse<null>>(`/admin/cms/banners/${id}`),

  /**
   * Public: Get page by slug
   */
  getPageBySlug: (slug: string) =>
    axiosClient.get<ApiResponse<StaticPageDTO>>(`/public/pages/${slug}`),

  /**
   * Admin: List all static pages
   */
  getAllPages: () =>
    axiosClient.get<ApiResponse<StaticPageDTO[]>>('/admin/cms/pages'),

  /**
   * Admin: Save static page
   */
  savePage: (payload: SaveStaticPageRequest) =>
    axiosClient.post<ApiResponse<StaticPageDTO>>('/admin/cms/pages', payload),
}
