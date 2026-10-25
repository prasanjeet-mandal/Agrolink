export function filterProducts(list, { query = '', category = null, minPrice = null, maxPrice = null, producerType = null, sort = 'relevance' } = {}) {
  let result = [...list];

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (p) =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.variety ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    );
  }
  if (category) result = result.filter((p) => p.category === category);
  if (producerType === 'FPO') result = result.filter((p) => p.isFpo);
  if (producerType === 'FARMER') result = result.filter((p) => !p.isFpo);
  if (minPrice != null) result = result.filter((p) => p.pricePerUnit >= Number(minPrice));
  if (maxPrice != null) result = result.filter((p) => p.pricePerUnit <= Number(maxPrice));

  switch (sort) {
    case 'price_asc':
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      break;
    case 'price_desc':
      result.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      break;
    default:
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return result;
}

export function getTrendingProducts(list, limit = 6) {
  return [...list]
    .filter((p) => p.status === 'ACTIVE')
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, limit);
}

export function getProductSuggestions(list, query) {
  return list
    .filter((p) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.variety ?? '').toLowerCase().includes(q)
      );
    })
    .map((p) => ({ id: p.id, label: `${p.name} (${p.variety})`, category: p.category }));
}