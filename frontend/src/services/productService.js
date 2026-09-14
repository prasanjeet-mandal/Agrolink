import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet, httpPost, httpPut, httpDelete } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const productService = {
  async getAll() {
    if (!MOCK_MODE) return httpGet(API.PRODUCTS.BASE);
    return mockDb.listProducts();
  },

  async getById(productId) {
    if (!MOCK_MODE) return httpGet(`${API.PRODUCTS.BASE}/${productId}`);
    return mockDb.getProduct(productId);
  },

  async getMine(producerId) {
    if (!MOCK_MODE) return httpGet(API.PRODUCTS.MY);
    return mockDb.productsByProducer(producerId);
  },

  async getCategories() {
    if (!MOCK_MODE) return httpGet(API.PRODUCTS.CATEGORIES);
    return mockDb.getCategories();
  },

  async create(product) {
    if (!MOCK_MODE) return httpPost(API.PRODUCTS.BASE, product);
    return { ...product, id: `pr${Date.now()}`, createdAt: new Date().toISOString(), status: 'ACTIVE' };
  },

  async update(productId, product) {
    if (!MOCK_MODE) return httpPut(`${API.PRODUCTS.BASE}/${productId}`, product);
    return { ...product, id: productId };
  },

  async remove(productId) {
    if (!MOCK_MODE) return httpDelete(`${API.PRODUCTS.BASE}/${productId}`);
    return { id: productId };
  },
};