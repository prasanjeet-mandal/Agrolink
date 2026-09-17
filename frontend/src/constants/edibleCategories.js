import { commodityImageOf } from '@/constants/commodityImages';

export const EDIBLE_CATEGORIES = [
  'grains & pulses',
  'oilseeds',
  'vegetables',
  'fruits',
  'spices',
  'dairy',
  'cereals',
  'pulses',
  'millets',
  'nuts & dry fruits',
  'herbs & spices',
  'dairy & poultry',
  'beverages',
  'perishables',
];

const EDIBLE_SET = new Set(EDIBLE_CATEGORIES);

export function isEdibleProduct({ name, category } = {}) {
  const cat = String(category ?? '').trim().toLowerCase();
  if (cat) return EDIBLE_SET.has(cat);
  return commodityImageOf(name) !== null;
}