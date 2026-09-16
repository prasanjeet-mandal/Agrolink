import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toUserProfile } from '@/services/normalize';
import { orderService } from '@/services/orderService';

const ACTIVE_STATUS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'IN_TRANSIT'];

export const consumerService = {
  async getProfile(_userId) {
    const res = await httpGet(API.USERS.ME);
    const { profile } = toUserProfile(res);
    return profile ?? { id: `c${res.id}`, userId: res.id, fullName: res.fullName };
  },

  async getDashboard(_userId) {
    const res = await httpGet(API.USERS.ME);
    const profile = toUserProfile(res).profile ?? null;
    const ordersList = await orderService.getMine({ role: res.role, userId: res.id });
    const active = ordersList.filter((o) => ACTIVE_STATUS.includes(o.status));
    const completed = ordersList.filter((o) => o.status === 'DELIVERED');
    const totalSpent = completed.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0);
    return {
      profile,
      stats: {
        orders: ordersList.length,
        activeOrders: active.length,
        delivered: completed.length,
        totalSpent,
      },
      recentOrders: ordersList.slice(0, 4),
    };
  },
};