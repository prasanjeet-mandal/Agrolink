import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const demandService = {
  async getForecasts() {
    if (!MOCK_MODE) return httpGet(API.DEMAND.FORECAST);
    return mockDb.listDemandForecasts();
  },

  async getForecastForProduct(productId) {
    if (!MOCK_MODE) return httpGet(`${API.DEMAND.FORECAST}/${productId}`);
    const all = await mockDb.listDemandForecasts();
    return all.find((d) => d.productId === productId) ?? null;
  },
};