import { httpGet, httpPost, httpPut, httpDelete } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { mockDb } from '@/mocks/db';

export const productService = {
  async getAll() {
    try {
      const res = await httpGet(API.PRODUCTS.BASE);
      return res.map(normalize);
    } catch (err) {
      return mockDb.listActiveProducts();
    }
  },

  async getById(productId) {
    try {
      const res = await httpGet(`${API.PRODUCTS.BASE}/${productId}`);
      return normalize(res);
    } catch (err) {
      return mockDb.getProduct(productId);
    }
  },

  async getMine() {
    const res = await httpGet(API.PRODUCTS.MY);
    return res.map(normalize);
  },

  async getCategories() {
    try {
      const res = await httpGet(API.CATEGORIES.BASE);
      return res.map((c) => c.name);
    } catch (err) {
      return mockDb.getCategories();
    }
  },

  async create(product) {
    const res = await httpPost(API.PRODUCTS.BASE, await toRequest(product));
    return normalize(res);
  },

  async update(productId, product) {
    const res = await httpPut(`${API.PRODUCTS.BASE}/${productId}`, await toRequest(product));
    return normalize(res);
  },

  async remove(productId) {
    return httpDelete(`${API.PRODUCTS.BASE}/${productId}`);
  },
};

function normalize(p) {
  const location = parseLocation(p.location);
  return {
    id: p.id,
    name: p.name,
    icon: p.imageUrl ?? null,
    category: p.categoryName ?? '',
    variety: p.variety ?? p.name ?? '',
    unit: p.unit ?? '',
    pricePerUnit: Number(p.price ?? 0),
    stockQuantity: Number(p.availableQuantity ?? 0),
    minOrderQuantity: p.minOrderQuantity ?? 1,
    description: p.description ?? '',
    producerId: String(p.sellerId ?? ''),
    producerName: p.sellerName ?? '',
    producerType: p.sellerRole === 'FPO' ? 'FPO' : 'FARMER',
    isFpo: p.sellerRole === 'FPO',
    quality: p.quality ?? 'Standard',
    certification: p.certification ?? [],
    location,
    producerRating: p.sellerRating ?? null,
    producerVerified: p.sellerVerified ?? true,
    producerDistrict: location.district,
    producerState: location.state,
    status: p.status ?? 'ACTIVE',
    latitude: p.latitude ?? null,
    longitude: p.longitude ?? null,
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

const parseLocation = (loc) => {
  if (!loc) return { state: '', district: '', village: '' };
  if (typeof loc === 'object') {
    return { state: loc.state ?? '', district: loc.district ?? '', village: loc.village ?? '' };
  }
  const parts = String(loc).split(',').map((s) => s.trim()).filter(Boolean);
  return {
    state: parts[parts.length - 1] ?? '',
    district: parts[parts.length - 2] ?? '',
    village: parts.slice(0, -2).join(' ') ?? '',
  };
};

async function categoryIdOf(name) {
  const list = await (await httpGet(API.CATEGORIES.BASE));
  const match = list.find((c) => c.name.toLowerCase() === String(name ?? '').toLowerCase());
  return match?.id ?? null;
}

async function toRequest(product) {
  const categoryId = product.categoryId ?? (await categoryIdOf(product.category));
  if (!categoryId) {
    throw new Error(`Category "${product.category}" is not supported`);
  }
  return {
    name: product.name,
    description: product.description ?? '',
    price: Number(product.pricePerUnit ?? product.price ?? 0),
    unit: product.unit ?? 'kg',
    availableQuantity: Number(product.stockQuantity ?? product.availableQuantity ?? 0),
    imageUrl: product.image ?? product.imageUrl ?? null,
    location: product.locationText?.trim()
      ? product.locationText
      : product.location?.state
        ? [product.location.district, product.location.state].filter(Boolean).join(', ')
        : (product.locationText ?? null),
    latitude: product.latitude ?? null,
    longitude: product.longitude ?? null,
    categoryId,
  };
}