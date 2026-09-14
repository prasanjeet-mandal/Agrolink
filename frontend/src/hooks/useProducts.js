import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplaceService';
import { productService } from '@/services/productService';

export function useProducts() {
  const [params, setSearchParams] = useSearchParams();
  const [products, setProducts] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const min = params.get('min');
  const max = params.get('max');
  const source = params.get('source') ?? '';
  const sort = params.get('sort') ?? 'newest';

  const search = React.useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await marketplaceService.search({
          query: overrides.query ?? query,
          category: overrides.category ?? category,
          minPrice: overrides.min ?? min,
          maxPrice: overrides.max ?? max,
          producerType: overrides.source ?? source,
          sort: overrides.sort ?? sort,
        });
        setProducts(data);
      } catch (e) {
        setError(e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [query, category, min, max, source, sort]
  );

  React.useEffect(() => {
    search();
  }, [search]);

  const setFilter = React.useCallback(
    (name, value) => {
      const next = new URLSearchParams(params);
      if (value) next.set(name, value);
      else next.delete(name);
      setSearchParams(next);
    },
    [params, setSearchParams]
  );

  const reset = React.useCallback(() => setSearchParams({}), [setSearchParams]);

  const refresh = React.useCallback(async (producerId) => {
    if (!producerId) return search();
    const mine = await productService.getMine(producerId);
    setProducts(mine);
  }, [search]);

  return {
    products, loading, error, query, category, min, max, source, sort,
    setFilter, reset, refresh, search,
  };
}