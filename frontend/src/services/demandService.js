import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const demandService = {
  async getForecasts() {
    const res = await httpGet(API.DEMAND.FORECAST);
    return Array.isArray(res) ? res : res.forecasts ?? [];
  },

  async getForecastForProduct(productId) {
    return httpGet(`${API.DEMAND.FORECAST}/${productId}`);
  },
};