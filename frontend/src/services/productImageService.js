import { httpGet } from '@/api/client';

const cache = new Map();
const inFlight = new Map();

const FILTER_WORDS = new Set([
  'organic', 'fresh', 'premium', 'ripe', 'hybrid', 'kachi', 'ghani',
]);

const buildQuery = ({ name, variety, category }) => {
  const pieces = [];
  if (name) {
    pieces.push(
      String(name)
        .replace(/\([^)]*\)/g, ' ')
        .split(/\s+/)
        .filter((w) => w && !FILTER_WORDS.has(w.toLowerCase()))
        .slice(0, 3)
        .join(' ')
    );
  }
  if (variety && variety.toLowerCase() !== String(name ?? '').toLowerCase()) {
    pieces.push(variety);
  }
  if (category && !String(name ?? '').toLowerCase().includes(String(category).toLowerCase())) {
    pieces.push(category);
  }
  const raw = pieces.join(' ').replace(/\s+/g, ' ').trim();
  return raw || 'farm produce';
};

const fetchImage = (query) =>
  httpGet('/api/images', { q: query }).then((res) => res?.data?.url ?? '');

export function resolveProductImage(product) {
  const query = buildQuery(product).toLowerCase();

  if (cache.has(query)) {
    return Promise.resolve(cache.get(query));
  }

  if (inFlight.has(query)) {
    return inFlight.get(query);
  }

  const promise = fetchImage(query)
    .then((url) => {
      if (url) cache.set(query, url);
      return url;
    })
    .finally(() => inFlight.delete(query));

  inFlight.set(query, promise);
  return promise;
}

export function clearProductImageCache() {
  cache.clear();
}