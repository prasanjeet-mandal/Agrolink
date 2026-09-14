import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const paymentService = {
  async getMine({ role, userId, producerId } = {}) {
    if (!MOCK_MODE) return httpGet(API.PAYMENTS.MY);
    return mockDb.listPayments({ role, userId, producerId });
  },

  async create(payment) {
    if (!MOCK_MODE) return httpPost(API.PAYMENTS.CREATE, payment);
    return mockDb.createPayment(payment);
  },

  async verify(paymentId) {
    if (!MOCK_MODE) return httpGet(`${API.PAYMENTS.VERIFY}/${paymentId}`);
    return { paymentId, verified: true };
  },
};