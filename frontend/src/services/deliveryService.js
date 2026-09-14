import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const deliveryService = {
  async getStatus(orderId) {
    if (!MOCK_MODE) return httpGet(`${API.DELIVERY.STATUS}/${orderId}`);
    return mockDb.shipmentForOrder(orderId);
  },

  async confirmDelivery(orderId) {
    if (!MOCK_MODE) return httpPost(API.DELIVERY.CONFIRM, { orderId });
    return mockDb.updateOrderStatus(orderId, 'DELIVERED');
  },
};