import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const marketplaceService = {
  async search(params) {
    if (!MOCK_MODE) return httpGet(API.MARKETPLACE.BASE, params);
    return mockDb.searchProducts(params);
  },

  async trending() {
    if (!MOCK_MODE) return httpGet(API.MARKETPLACE.TRENDING);
    return mockDb.trendingProducts();
  },

  async suggestions(query) {
    if (!MOCK_MODE) return httpGet(API.PRODUCTS.SEARCH, { query });
    const results = await mockDb.searchProducts({ query });
    return results.map((p) => ({ id: p.id, label: `${p.name} (${p.variety})`, category: p.category }));
  },
};