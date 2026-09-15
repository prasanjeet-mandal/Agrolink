export const PRODUCT_CATALOG = [
  { name: 'Basmati Rice (Premium)', variety: 'Pusa 1121', category: 'Grains & Pulses', icon: '🌾', image: '/assets/products/pr1.jpg' },
  { name: 'Mustard Oil (Kachi Ghani)', variety: 'Yellow Sarson', category: 'Oilseeds', icon: '🫒', image: '/assets/products/pr2.jpg' },
  { name: 'Sharbati Wheat', variety: 'Sharbati', category: 'Grains & Pulses', icon: '🌾', image: '/assets/products/pr3.jpg' },
  { name: 'Fresh Potatoes', variety: 'Kufri Jyoti', category: 'Vegetables', icon: '🥔', image: '/assets/products/pr4.jpg' },
  { name: 'Organic Wheat Flour (Atta)', variety: 'Organic Lokvan', category: 'Grains & Pulses', icon: '🌾', image: '/assets/products/pr5.jpg' },
  { name: 'Tomatoes (Ripe Gassed-free)', variety: 'Hybrid', category: 'Vegetables', icon: '🍅', image: '/assets/products/pr6.jpg' },
  { name: 'Thompson Seedless Grapes', variety: 'Thompson Seedless', category: 'Fruits', icon: '🍇', image: '/assets/products/pr7.jpg' },
  { name: 'Onions (Red)', variety: 'Nasik Red', category: 'Vegetables', icon: '🧅', image: '/assets/products/pr8.jpg' },
  { name: 'Organic Turmeric Powder', variety: 'Salem', category: 'Spices', icon: '🧡', image: '/assets/products/pr9.jpg' },
  { name: 'Ragi (Finger Millet)', variety: 'Indaf-8', category: 'Grains & Pulses', icon: '🌾', image: '/assets/products/pr10.jpg' },
  { name: 'Fresh Tomatoes (Cherry)', variety: 'Cherry', category: 'Vegetables', icon: '🍅', image: '/assets/products/pr11.jpg' },
  { name: 'Yellow Mustard Seeds', variety: 'Pusa Bold', category: 'Oilseeds', icon: '🟡', image: '/assets/products/pr12.jpg' },
  { name: 'Fresh Cow Milk (Bulk)', variety: 'Whole', category: 'Dairy', icon: '🥛', image: '/assets/products/pr13.jpg' },
  { name: 'Groundnut Kernels', variety: 'TG 37A', category: 'Oilseeds', icon: '🥜', image: '/assets/products/pr14.jpg' },
  { name: 'Turmeric Finger (Raw)', variety: 'Salem', category: 'Spices', icon: '🧡', image: '/assets/products/pr15.jpg' },
];

export function searchProducts(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCT_CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  ).slice(0, limit);
}