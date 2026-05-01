export type ApiResponse<T = unknown> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  errors?: any;
  timestamp: string;
};
