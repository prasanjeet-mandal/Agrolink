import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/productService';
import { PageHeader, Loading, EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import ProductCard from './ProductCard';

export default function Marketplace() {
  const {
    products, loading, error, query, category, min, max, source, sort,
    setFilter, reset,
  } = useProducts();
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filters = { category, source, minPrice: min, maxPrice: max, sort };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace"
        description="Buy directly from verified farmers and FPOs — no middlemen."
      />

      <SearchBar
        value={query}
        onChange={(q) => setFilter('q', q)}
        onSearch={(q) => setFilter('q', q)}
        showTrending
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <SearchFilters
          categories={categories}
          filters={filters}
          onChange={(field, value) => setFilter(field, value)}
          onReset={reset}
          resultCount={products?.length}
        />

        <div>
          {loading ? (
            <Loading label="Fetching fresh produce…" />
          ) : error ? (
            <EmptyState title="Could not load products" description={error} />
          ) : !products?.length ? (
            <EmptyState
              title="No products match your filters"
              description="Try clearing filters or searching for something else."
              action={
                <Button variant="outline" size="sm" onClick={reset}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-primary/5 p-4 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        Pro tip — prices shown are farmer-set. Use the Pricing tool to compare with live mandi trends before ordering in bulk.
      </div>
    </div>
  );
}