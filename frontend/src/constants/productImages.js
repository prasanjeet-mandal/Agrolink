export const PRODUCT_IMAGES = {
  pr1: '/assets/products/pr1.jpg',
  pr2: '/assets/products/pr2.jpg',
  pr3: '/assets/products/pr3.jpg',
  pr4: '/assets/products/pr4.jpg',
  pr5: '/assets/products/pr5.jpg',
  pr6: '/assets/products/pr6.jpg',
  pr7: '/assets/products/pr7.jpg',
  pr8: '/assets/products/pr8.jpg',
  pr9: '/assets/products/pr9.jpg',
  pr10: '/assets/products/pr10.jpg',
  pr11: '/assets/products/pr11.jpg',
  pr12: '/assets/products/pr12.jpg',
  pr13: '/assets/products/pr13.jpg',
  pr14: '/assets/products/pr14.jpg',
  pr15: '/assets/products/pr15.jpg',
};

export function productImageOf(productId) {
  if (productId === null || productId === undefined || productId === '') {
    return null;
  }

  const value = String(productId);
  const key = value.startsWith('pr') ? value : `pr${value}`;
  return PRODUCT_IMAGES[key] ?? null;
}