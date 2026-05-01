import axiosClient from './axiosClient';
import type { ApiResponse, ReviewDTO, PostReviewRequest, PostCommentRequest, RatingSummaryDTO } from '../types';

const feedbackApi = {
  getProductReviews: (productId: string, page = 0, size = 10) => {
    return axiosClient.get<ApiResponse<ReviewDTO[]>>(`/feedback/products/${productId}/reviews?page=${page}&size=${size}`);
  },

  getRatingSummary: (productId: string) => {
    return axiosClient.get<ApiResponse<RatingSummaryDTO>>(`/feedback/products/${productId}/rating-summary`);
  },

  postReview: (request: PostReviewRequest) => {
    return axiosClient.post<ApiResponse<void>>('/feedback/reviews', request);
  },

  postComment: (reviewId: string, request: PostCommentRequest) => {
    return axiosClient.post<ApiResponse<void>>(`/feedback/reviews/${reviewId}/comments`, request);
  },
};

export default feedbackApi;
