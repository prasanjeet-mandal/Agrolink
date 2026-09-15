import { httpGet, httpPut } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toBackendStatus, toOrder } from '@/services/normalize';

export const adminService = {
  async getStats() {
    return httpGet(API.ADMIN.STATS);
  },

  async listOrders() {
    const res = await httpGet(API.ADMIN.ORDERS);
    return (Array.isArray(res) ? res : []).map(toOrder);
  },

  async updateOrderStatus(orderId, status) {
    const url = `${API.ADMIN.ORDERS}/${orderId}?status=${encodeURIComponent(toBackendStatus(status))}`;
    return toOrder(await httpPut(url));
  },

  async listUsers() {
    const res = await httpGet(API.ADMIN.USERS);
    return (Array.isArray(res) ? res : []).map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      enabled: u.enabled,
    }));
  },

  async setUserEnabled(userId, enabled) {
    const url = `${API.ADMIN.USERS}/${userId}?enabled=${enabled}`;
    return httpPut(url);
  },

  async listProducts() {
    const res = await httpGet(API.ADMIN.PRODUCTS);
    return (Array.isArray(res) ? res : []).map((p) => ({
      id: p.id,
      name: p.name,
      sellerName: p.sellerName,
      categoryName: p.categoryName,
      price: Number(p.price ?? 0),
      unit: p.unit ?? 'kg',
      availableQuantity: Number(p.availableQuantity ?? 0),
      location: p.location ?? '',
      status: p.status,
    }));
  },

  async setProductStatus(productId, status) {
    const url = `${API.ADMIN.PRODUCTS}/${productId}?status=${encodeURIComponent(status)}`;
    return httpPut(url);
  },

  async listReviews() {
    const res = await httpGet(API.ADMIN.REVIEWS);
    return (Array.isArray(res) ? res : []).map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      buyerName: r.buyerName,
      rating: r.rating,
      comment: r.comment ?? '',
      status: r.status,
    }));
  },

  async moderateReview(reviewId, status) {
    const url = `${API.ADMIN.REVIEWS}/${reviewId}?status=${encodeURIComponent(status)}`;
    return httpPut(url);
  },
};