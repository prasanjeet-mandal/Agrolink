import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, MapPin, PackageCheck, ShoppingCart, Star, Truck,
} from 'lucide-react';
import { productService } from '@/services/productService';
import { useCartContext } from '@/context/CartContext';
import { useToast } from '@/components/ui/toast';
import { Loading, ProductImage } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantityInput } from '@/components/forms';
import PriceDisplay from './PriceDisplay';

export default function ProductDetails({ requestQuoteTo = null }) {
  const { productId } = useParams();
  const { addItem } = useCartContext();
  const { toast } = useToast();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService.getById(productId)
      .then((data) => {
        if (mounted) {
          setProduct(data);
          setQuantity(data.minOrderQuantity ?? 1);
        }
      })
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [productId]);

  if (loading) return <Loading label="Loading product…" />;
  if (error || !product) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">{error ?? 'Product not found.'}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/marketplace">Back to marketplace</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleAdd = () => {
    if (Number(product.stockQuantity ?? 0) <= 0) {
      toast({
        title: 'Out of stock',
        description: `${product.name} is currently unavailable.`,
        variant: 'destructive',
      });
      return;
    }
    addItem(product, quantity);
    toast({
      title: 'Added to cart',
      description: `${quantity} ${product.unit} of ${product.name}`,
      variant: 'success',
    });
  };

  const outOfStock = Number(product.stockQuantity ?? 0) <= 0;

  const requestLink = requestQuoteTo
    ? requestQuoteTo.replace(':productId', product.id)
    : `/consumer/products/${product.id}/request`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/marketplace">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProductImage productId={product.id} icon={product.icon} category={product.category} name={product.name} className="aspect-square rounded-2xl" textClassName="text-7xl" />

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.variety}</Badge>
            {product.isFpo ? <Badge variant="accent">FPO / Co-op</Badge> : null}
            {product.quality ? <Badge variant="success">{product.quality}</Badge> : null}
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
          </div>

          <PriceDisplay price={product.pricePerUnit} perUnit size="lg" unit={product.unit} />

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <PackageCheck className="h-4 w-4 text-primary" />
              Available:{' '}
              {outOfStock ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : (
                <strong className="text-foreground">{product.stockQuantity.toLocaleString('en-IN')} {product.unit}</strong>
              )}
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              Minimum order: <strong className="text-foreground">{product.minOrderQuantity} {product.unit}</strong>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {product.location?.village ? `${product.location.village}, ` : ''}
              {product.location?.district}, {product.location?.state}
            </li>
          </ul>

          <Separator />

          <Card className="bg-muted/40">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {product.producerName}
                  {product.producerVerified ? <BadgeCheck className="h-4 w-4 text-primary" /> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.producerDistrict}, {product.producerState} · Producer rating{' '}
                  {product.producerRating ? (
                    <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.producerRating.toFixed(1)}
                    </span>
                  ) : '—'}
                </p>
              </div>
              {product.certification?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {product.certification.map((c) => (
                    <Badge key={c} variant="outline">{c}</Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            {outOfStock ? (
              <Button size="lg" disabled className="gap-2">
                <ShoppingCart className="h-4 w-4" /> Out of stock
              </Button>
            ) : (
              <>
                <QuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  min={product.minOrderQuantity ?? 1}
                  max={product.stockQuantity}
                  size="lg"
                />
                <Button size="lg" onClick={handleAdd} className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </Button>
              </>
            )}
            <Button asChild variant="outline" size="lg">
              <Link to={requestLink}>Request bulk quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}