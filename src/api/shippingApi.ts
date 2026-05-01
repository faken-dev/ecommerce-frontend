import axiosClient from './axiosClient';
import type { ApiResponse, ShipmentResponse } from '../types';

export interface CreateShipmentRequest {
  orderId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  country: string;
  weight?: number;
  shippingFee?: number;
}

export const shippingApi = {
  listShipments: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<ShipmentResponse[]>>('/shipping', { params }),

  getShipment: (id: string) => 
    axiosClient.get<ApiResponse<ShipmentResponse>>(`/shipping/${id}`),

  getShipmentByOrder: (orderId: string) => 
    axiosClient.get<ApiResponse<ShipmentResponse>>(`/shipping/order/${orderId}`),

  createShipment: (data: CreateShipmentRequest, carrier?: string) => 
    axiosClient.post<ApiResponse<ShipmentResponse>>('/shipping', data, {
      params: { carrier }
    }),

  updateStatus: (id: string, status: string, note?: string) => 
    axiosClient.patch<ApiResponse<ShipmentResponse>>(`/shipping/${id}/status`, {
      status,
      note
    })
};
