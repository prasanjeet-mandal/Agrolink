import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const producerService = {
  async getProfile(userId) {
    if (!MOCK_MODE) return httpGet(`${API.PRODUCERS.PROFILE}/${userId}`);
    return mockDb.getProducerByUserId(userId);
  },

  async getById(producerId) {
    if (!MOCK_MODE) return httpGet(`${API.PRODUCERS.BASE}/${producerId}`);
    return mockDb.getProducerById(producerId);
  },

  async getStats(producerId) {
    if (!MOCK_MODE) return httpGet(API.PRODUCERS.STATS);
    return mockDb.getProducerStat(producerId);
  },
};