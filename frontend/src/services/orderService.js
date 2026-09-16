import { httpGet, httpPost, httpDelete } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { ROLES } from '@/constants/roles';
import { toOrder, toBackendStatus, toBackendPaymentStatus } from '@/services/normalize';
import { addressService } from '@/services/addressService';

async function syncCart(items) {
  await httpDelete(API.CART.BASE).catch(() => null);
  const seen = new Map();
  for (const item of items ?? []) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    seen.set(productId, (seen.get(productId) ?? 0) + quantity);
  }
  for (const [productId, quantity] of seen) {
    await httpPost(API.CART.ITEMS, { productId, quantity });
  }
}

export const orderService = {
  async getMine({ role, userId: _userId }) {
    const asProducer = role === ROLES.FARMER || role === ROLES.FPO;
    const res = asProducer ? await httpGet(API.ORDERS.SELLER) : await httpGet(API.ORDERS.BASE);
    if (Array.isArray(res)) return res.map(toOrder);
    return (res.orders ?? []).map(toOrder);
  },

  async getById(orderId) {
    const res = await httpGet(`${API.ORDERS.BASE}/${orderId}`);
    return toOrder(res);
  },

  async place(order) {
    const address = await addressService.findOrCreate(order.deliveryAddress);
    await syncCart(order.items ?? []);
    const res = await httpPost(API.ORDERS.CHECKOUT, { shippingAddressId: address.id });
    return toOrder(res);
  },

  async updateStatus(orderId, status, _actor) {
    const res = await httpPost(`${API.ORDERS.BASE}/${orderId}/status`, { status: toBackendStatus(status) });
    return toOrder(res);
  },

  async updatePayment(orderId, status) {
    const backend = toBackendPaymentStatus(status);
    if (backend === 'PAID') {
      return httpPost(`${API.PAYMENTS.VERIFY}/${orderId}/confirm`, {});
    }
    return httpPost(`${API.PAYMENTS.CREATE}/${orderId}`, { method: 'UPI' });
  },

  async getSellerOrders(_producerId) {
    const res = await httpGet(API.ORDERS.SELLER);
    return (Array.isArray(res) ? res : res.orders ?? []).map(toOrder);
  },

  async getPurchases(_producerId) {
    const res = await httpGet(API.ORDERS.BASE);
    return (Array.isArray(res) ? res : res.orders ?? []).map(toOrder);
  },
};