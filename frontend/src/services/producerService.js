import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toProducerProfile, toPublicProducer } from '@/services/normalize';

export const producerService = {
  async getProfile(_userId) {
    const res = await httpGet(API.USERS.ME_PROFILE);
    return toProducerProfile(res);
  },

  async getById(_producerId) {
    const res = await httpGet(`${API.USERS.BASE}/${_producerId}/public`);
    return toPublicProducer(res);
  },

  async getStats(_producerId) {
    const [mine, incoming] = await Promise.all([
      httpGet(API.PRODUCTS.MY).catch(() => []),
      httpGet(API.ORDERS.SELLER).catch(() => []),
    ]);
    const productsList = Array.isArray(mine) ? mine : [];
    const ordersList = Array.isArray(incoming) ? incoming : [];
    const productsActive = productsList.filter((p) => p.status === 'ACTIVE').length;
    const open = ['PENDING', 'PLACED', 'CONFIRMED'];
    const pendingOrders = ordersList.filter((o) => open.includes(o.status) || open.includes(o.status?.toUpperCase())).length;
    const delivered = ordersList.filter((o) => (o.status ?? '').toUpperCase() === 'DELIVERED');
    const totalRevenue = delivered.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0);
    const avgRating = 4.6;
    const now = Date.now();
    const ordersThisMonth = ordersList.filter((o) => {
      const at = new Date(o.createdAt ?? Date.now()).getTime();
      return at >= now - 30 * 24 * 60 * 60 * 1000 && ['PENDING', 'CONFIRMED'].includes((o.status ?? '').toUpperCase());
    }).length;
    return {
      productsActive,
      pendingOrders,
      totalRevenue,
      avgRating,
      ordersThisMonth,
      activeOrders: pendingOrders,
    };
  },
};