import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartContext } from '@/context/CartContext';
import { PageHeader, EmptyState, ProductImage } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantityInput } from '@/components/forms';
import { formatPrice } from '@/utils/formatPrice';

export default function Cart() {
  const { items, updateQuantity, removeItem, clear, subtotal, itemCount } = useCartContext();
  const navigate = useNavigate();

  const deliveryFee = subtotal > 5000 ? 0 : subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;

  if (!items.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Your cart" description="Everything you plan to order." />
        <Card>
          <CardContent>
            <EmptyState
              title="Your cart is empty"
              description="Browse the marketplace and add fresh produce to get started."
              action={
                <Button asChild>
                  <Link to="/marketplace"><ShoppingCart className="h-4 w-4" /> Browse marketplace</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your cart"
        description={`${itemCount} items to order`}
        actions={
          <Button variant="ghost" onClick={() => { clear(); }} className="text-destructive">
            <Trash2 className="h-4 w-4" /> Clear cart
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <Link to={`/marketplace/${item.productId}`} className="shrink-0">
                  <ProductImage productId={item.productId} icon={item.icon} category={item.category} name={item.name} className="h-20 w-20 rounded-lg" textClassName="text-2xl" />
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link to={`/marketplace/${item.productId}`}>
                    <p className="truncate text-sm font-bold hover:underline">{item.name}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.producerName}</p>
                  <p className="text-sm font-semibold text-primary">{formatPrice(item.pricePerUnit)}/{item.unit}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <QuantityInput value={item.quantity} onChange={(q) => updateQuantity(item.productId, q)} min={1} />
                  <p className="text-sm font-bold">{formatPrice(item.pricePerUnit * item.quantity)}</p>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-bold">Order summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="font-medium">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {deliveryFee === 0 ? (
              <p className="rounded-md bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                You unlocked free delivery on this order 🎉
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add {formatPrice(5000 - subtotal)} more for free delivery.
              </p>
            )}
            <Button className="w-full gap-2" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}