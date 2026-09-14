import MarketplaceProductDetails from '@/pages/marketplace/ProductDetails';

export default function ProductDetails() {
  return <MarketplaceProductDetails requestQuoteTo="/consumer/products/:productId/request" />;
}