import * as React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { PageHeader, Loading, EmptyState, ProductImage, StatCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';

export default function SellProducts() {
  const { user } = useAuth();
  const [products, setProducts] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      productService.getMine(p.id).then((pr) => {
        if (mounted) setProducts(pr);
      }).finally(() => mounted && setLoading(false));
    });
    return () => { mounted = false; };
  }, [user.id]);

  if (loading) return <Loading label="Loading sellable products…" />;

  const live = products.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sell products"
        description="Your pooled listings, live to consumers and businesses on Agrolink."
        actions={<Button asChild className="gap-2"><Link to="/producer/fpo/products/add"><PackagePlus className="h-4 w-4" /> Add product</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Live listings" value={live.length} icon={Store} />
        <StatCard label="Total stock" value={`${products.reduce((s, p) => s + p.stockQuantity, 0).toLocaleString('en-IN')} units`} icon={PackagePlus} />
        <StatCard label="Price range" value={<span>{formatPrice(Math.min(...products.map((p) => p.pricePerUnit)))} – {formatPrice(Math.max(...products.map((p) => p.pricePerUnit)))}</span>} icon={PackagePlus} />
      </div>

      {!live.length ? (
        <EmptyState
          title="Nothing to sell yet"
          description="Add a pooled product to start selling to the marketplace."
          action={<Button asChild size="sm"><Link to="/producer/fpo/products/add">Add product</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {live.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="flex gap-3 p-4">
                <ProductImage productId={p.id} icon={p.icon} category={p.category} name={p.name} className="h-20 w-20 rounded-lg" textClassName="text-3xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold leading-snug">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.variety}</p>
                    </div>
                    {p.quality ? <Badge variant="success">{p.quality}</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stock {p.stockQuantity.toLocaleString('en-IN')} {p.unit} · Min {p.minOrderQuantity} {p.unit}
                  </p>
                  <p className="mt-1 text-sm font-bold">{formatPrice(p.pricePerUnit)}/{p.unit}</p>
                </div>
              </div>
              <CardContent className="flex items-center gap-2 border-t py-3">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/marketplace/${p.id}`}><Store className="h-4 w-4" /> View listing</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/producer/fpo/products/${p.id}/edit`}><PackagePlus className="h-4 w-4" /> Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}