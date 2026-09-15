import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { orderService } from '@/services/orderService';

export const deliveryService = {
  async getStatus(orderId) {
    return httpGet(`${API.DELIVERY.STATUS}/${orderId}`);
  },

  async confirmDelivery(orderId) {
    const result = await httpPost(API.DELIVERY.CONFIRM, { orderId });
    await orderService.updateStatus(orderId, 'DELIVERED').catch(() => null);
    return result;
  },
};