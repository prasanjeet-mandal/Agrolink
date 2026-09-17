import { httpGet } from '@/api/client';

const cache = new Map();
const inFlight = new Map();

const FILTER_WORDS = new Set([
  'organic', 'fresh', 'premium', 'ripe', 'hybrid', 'kachi', 'ghani',
  // geographic / varietal clutter that pollutes image searches
  'allahabad', 'safeda', 'robusta', 'nagpur', 'nasik', 'nashik', 'alphonso',
  'ratnagiri', 'delhi', 'punjab', 'himachal', 'tamil', 'nadu', 'kerala',
  'karnataka', 'maharashtra', 'gujarat', 'up', 'mp', 'bihar', 'rajasthan',
]);

const cleanPieces = (words) =>
  words
    .split(/\s+/)
    .filter((w) => w && !FILTER_WORDS.has(w.toLowerCase()))
    .join(' ');

const buildQuery = ({ name, variety, category }) => {
  const pieces = [];
  if (name) {
    const cleaned = cleanPieces(
      String(name).replace(/\([^)]*\)/g, ' ')
    );
    pieces.push(cleaned.split(/\s+/).slice(0, 3).join(' '));
  }
  if (variety && variety.toLowerCase() !== String(name ?? '').toLowerCase()) {
    const cleanedVariety = cleanPieces(variety);
    if (cleanedVariety) pieces.push(cleanedVariety);
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