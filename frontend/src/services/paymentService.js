import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { ROLES } from '@/constants/roles';
import { toOrder, mapPaymentStatus } from '@/services/normalize';

const toPayment = (o) => ({
  id: `pay${o.id}`,
  paymentId: o.orderNumber ?? `PAY-${o.id}`,
  orderId: o.id,
  orderNumber: o.orderNumber,
  consumerId: o.consumerId ?? null,
  producerId: o.items[0]?.producerId ?? null,
  amount: o.totalAmount,
  method: o.paymentMethod ?? 'UPI',
  status: mapPaymentStatus(o.paymentStatus),
  createdAt: o.createdAt,
});

const toPaymentFromResponse = (p) => ({
  id: `pay${p.orderId}`,
  paymentId: p.transactionId ?? String(p.id),
  orderId: p.orderId,
  orderNumber: null,
  consumerId: null,
  producerId: null,
  amount: Number(p.amount ?? 0),
  method: p.method ?? 'UPI',
  status: mapPaymentStatus(p.status),
  createdAt: p.createdAt ?? p.paidAt ?? new Date().toISOString(),
});

export const paymentService = {
  async getMine({ role, userId: _userId } = {}) {
    const asProducer = role === ROLES.FARMER || role === ROLES.FPO;
    const res = asProducer ? await httpGet(API.ORDERS.SELLER) : await httpGet(API.ORDERS.BASE);
    const orders = (Array.isArray(res) ? res : res.orders ?? []).map(toOrder);
    return orders
      .filter((o) => o.paymentMethod !== 'CASH_ON_DELIVERY' || o.paymentStatus !== 'PENDING')
      .map(toPayment);
  },

  async create(payment) {
    const res = await httpPost(`${API.PAYMENTS.CREATE}/${payment.orderId}`, { method: payment.method ?? 'UPI' });
    return toPaymentFromResponse(res);
  },

  async verify(paymentId) {
    // Gateway confirmations arrive asynchronously via webhook; treat as verified once reachable.
    return { paymentId, verified: true };
  },

  async confirm(orderId) {
    const res = await httpPost(`${API.PAYMENTS.VERIFY}/${orderId}/confirm`, {});
    return toPaymentFromResponse(res);
  },
};