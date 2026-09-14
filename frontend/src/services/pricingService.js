import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet, httpPost } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const pricingService = {
  async getForecast(productId) {
    if (!MOCK_MODE) return httpGet(`${API.PRICING.FORECAST}/${productId}`);
    return mockDb.getPriceForecast(productId);
  },

  async calculate(payload) {
    if (!MOCK_MODE) return httpPost(API.PRICING.CALCULATE, payload);
    const { basePrice, grades = [], mode = 'farmer_suggestion' } = payload;
    const gradeFactor = {
      standard: 1,
      premium: 1.08,
      'a-plus': 1.12,
      organic: 1.25,
    };
    const logisticFactor = mode === 'fpo_aggregation' ? 0.62 : 0.85;
    const costOfGrade = (grades.reduce((sum, g) => sum + (gradeFactor[g?.toLowerCase()] ?? 1), 0) / Math.max(1, grades.length)) ?? 1;
    const suggested = Number((basePrice * costOfGrade * logisticFactor).toFixed(2));
    return {
      suggested,
      min: Number((suggested * 0.92).toFixed(2)),
      max: Number((suggested * 1.08).toFixed(2)),
      factors: {
        grading: costOfGrade,
        logistics: logisticFactor,
        qualityNote: grades.length ? `Grading uplift applied (${grades.map((g) => gradeFactor[g?.toLowerCase()] ?? 1).join('x, ')}x)` : 'Standard grade',
      },
    };
  },

  async getTrend() {
    if (!MOCK_MODE) return httpGet(API.PRICING.TREND);
    return mockDb.recentFees();
  },
};