import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const pricingService = {
  async getForecast(productId) {
    return httpGet(`${API.PRICING.FORECAST}/${productId}`);
  },

  async calculate(payload) {
    return httpPost(API.PRICING.CALCULATE, payload);
  },

  async getTrend() {
    return httpGet(API.PRICING.TREND);
  },
};