import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toProduct } from '@/services/normalize';
import { filterProducts, getTrendingProducts, getProductSuggestions } from '@/utils/productFilters';

export const marketplaceService = {
  async search(params) {
    const res = await httpGet(API.MARKETPLACE.BASE, params?.query ? { q: params.query } : undefined);
    const list = res.map(toProduct);
    return filterProducts(list, params ?? {});
  },

  async trending() {
    const res = await httpGet(API.MARKETPLACE.BASE);
    return getTrendingProducts(res.map(toProduct));
  },

  async suggestions(query) {
    const res = await httpGet(API.MARKETPLACE.BASE, query ? { q: query } : undefined);
    return getProductSuggestions(res.map(toProduct), query);
  },
};