import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export const storageApi = {
  upload: (file: File, folder: string = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    
    return axiosClient.post<ApiResponse<{ url: string }>>('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
