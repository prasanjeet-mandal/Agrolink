import * as React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { useToast } from '@/components/ui/toast';
import { PageHeader, Loading, EmptyState, ProductImage } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuantityInput } from '@/components/forms';
import { formatPrice } from '@/utils/formatPrice';

export default function BuyProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [producer, setProducer] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState('All');
  const [qty, setQty] = React.useState({});
  const [placing, setPlacing] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([producerService.getProfile(user.id), productService.getAll()])
      .then(([p, pr]) => {
        if (!mounted) return;
        setProducer(p);
        setProducts(pr);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user.id]);

  const categories = React.useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const visible = React.useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [products, category]
  );

  const setQtyFor = (id) => (value) => setQty((prev) => ({ ...prev, [id]: value }));

  const procure = async (product) => {
    const quantity = qty[product.id] ?? product.minOrderQuantity;
    setPlacing(product.id);
    try {
      const total = quantity * product.pricePerUnit;
      await orderService.place({
        consumerId: producer.id,
        consumerName: producer.name,
        isFpoPurchase: true,
        deliveryAddress: producer.location,
        paymentMethod: 'UPI',
        items: [{
          productId: product.id,
          productName: product.name,
          icon: product.icon,
          unit: product.unit,
          quantity,
          pricePerUnit: product.pricePerUnit,
          producerId: product.producerId,
          total,
        }],
        totalAmount: total,
      });
      toast({
        title: 'Procurement placed',
        description: `${quantity} ${product.unit} of ${product.name} ordered from ${product.producerName ?? 'producer'}.`,
        variant: 'success',
      });
      setQty((prev) => ({ ...prev, [product.id]: product.minOrderQuantity }));
    } catch (err) {
      toast({ title: 'Could not place order', description: err.message, variant: 'error' });
    } finally {
      setPlacing(null);
    }
  };

  if (loading) return <Loading label="Loading procurement catalogue…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buy products"
        description="Procure produce from farmers and other FPOs for pooling or resale."
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to="/producer/fpo/orders/outgoing"><ShoppingCart className="h-4 w-4" /> Outgoing orders</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={
              category === c
                ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground'
                : 'rounded-full border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted'
            }
          >
            {c}
          </button>
        ))}
      </div>

      {!visible.length ? (
        <EmptyState
          title="No produce found"
          description="Try another category."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const q = qty[p.id] ?? p.minOrderQuantity;
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex gap-3 p-4">
                  <ProductImage productId={p.id} icon={p.icon} category={p.category} name={p.name} className="h-20 w-20 rounded-lg" textClassName="text-3xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold leading-snug">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.variety} · {p.category}</p>
                      </div>
                      {p.isFpo ? <Badge variant="accent">FPO</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Stock: {p.stockQuantity.toLocaleString('en-IN')} {p.unit} · Min {p.minOrderQuantity}
                    </p>
                    <p className="mt-1 text-sm font-bold">{formatPrice(p.pricePerUnit)}/{p.unit}</p>
                  </div>
                </div>
                <CardContent className="flex items-center justify-between gap-2 border-t py-3">
                  <QuantityInput value={q} onChange={setQtyFor(p.id)} min={p.minOrderQuantity} max={p.stockQuantity} />
                  <Button size="sm" className="gap-1" onClick={() => procure(p)} disabled={placing === p.id}>
                    <PackagePlus className="h-4 w-4" />
                    {placing === p.id ? 'Placing…' : `Procure ${formatPrice(q * p.pricePerUnit)}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}