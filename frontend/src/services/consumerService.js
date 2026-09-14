import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const consumerService = {
  async getProfile(userId) {
    if (!MOCK_MODE) return httpGet(`${API.CONSUMERS.PROFILE}/${userId}`);
    return mockDb.getConsumerByUserId(userId);
  },

  async getDashboard(userId) {
    if (!MOCK_MODE) return httpGet(API.CONSUMERS.DASHBOARD);
    const profile = await mockDb.getConsumerByUserId(userId);
    const ordersList = await mockDb.listOrders({ role: 'CONSUMER', userId });
    const active = ordersList.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING', 'IN_TRANSIT'].includes(o.status));
    const completed = ordersList.filter((o) => o.status === 'DELIVERED');
    const totalSpent = completed.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      profile,
      stats: {
        orders: ordersList.length,
        activeOrders: active.length,
        delivered: active.length,
        totalSpent,
      },
      recentOrders: ordersList.slice(0, 4),
    };
  },
};