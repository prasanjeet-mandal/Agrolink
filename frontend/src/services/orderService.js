import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const orderService = {
  async getMine({ role, userId }) {
    if (!MOCK_MODE) return httpGet(API.ORDERS.MY);
    return mockDb.listOrders({ role, userId });
  },

  async getById(orderId) {
    if (!MOCK_MODE) return httpGet(`${API.ORDERS.BASE}/${orderId}`);
    return mockDb.getOrder(orderId);
  },

  async place(order) {
    if (!MOCK_MODE) return httpPost(API.ORDERS.BASE, order);
    return mockDb.createOrder(order);
  },

  async updateStatus(orderId, status, actor) {
    if (!MOCK_MODE) return httpPost(`${API.ORDERS.BASE}/${orderId}/status`, { status });
    return mockDb.updateOrderStatus(orderId, status, { actor });
  },

  async updatePayment(orderId, status) {
    if (!MOCK_MODE) return httpPost(`${API.ORDERS.BASE}/${orderId}/payment`, { status });
    return mockDb.updateOrderPayment(orderId, status);
  },

  async getSellerOrders(producerId) {
    if (!MOCK_MODE) return httpGet(API.ORDERS.SELLER);
    return mockDb.listOrders({ producerId });
  },

  async getPurchases(producerId) {
    if (!MOCK_MODE) return httpGet(API.ORDERS.MY);
    return mockDb.listFpoPurchases(producerId);
  },
};