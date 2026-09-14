import * as React from 'react';
import { Link } from 'react-router-dom';
import { Package, PackagePlus, ShoppingCart, Star, Users, Banknote, ListOrdered } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { PageHeader, Loading, StatCard, OrderStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function Dashboard() {
  const { user } = useAuth();
  const [producer, setProducer] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [incoming, setIncoming] = React.useState([]);
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      setProducer(p);
      Promise.all([
        productService.getMine(p.id).catch(() => []),
        orderService.getSellerOrders(p.id).catch(() => []),
        producerService.getStats(p.id).catch(() => null),
      ]).then(([pr, inc, s]) => {
        if (!mounted) return;
        setProducts(pr);
        setIncoming(inc);
        setStats(s);
      });
    });
    return () => { mounted = false; };
  }, [user.id]);

  if (!producer || !stats) return <Loading label="Loading FPO dashboard…" />;

  const pending = incoming.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status));
  const upcoming = pending.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${producer.name} 🏛️`}
        description={`${producer.fpoType} · ${producer.location.district}, ${producer.location.state} · ${producer.memberFarmers} member farmers`}
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/producer/fpo/products/buy"><ShoppingCart className="h-4 w-4" /> Procure produce</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/producer/fpo/products/add"><PackagePlus className="h-4 w-4" /> Add product</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Member farmers" value={producer.memberFarmers} icon={Users} hint="aggregated into 1 listing account" />
        <StatCard label="Products live" value={products.filter((p) => p.status === 'ACTIVE').length} icon={Package} />
        <StatCard label="Orders to fulfil" value={pending.length} icon={ListOrdered} hint="awaiting your action" />
        <StatCard label="Revenue to date" value={formatPrice(stats.totalRevenue, { compact: true })} icon={Banknote} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Incoming orders</CardTitle>
            <Button asChild variant="link" size="sm" className="p-0">
              <Link to="/producer/fpo/orders/incoming">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? (
              upcoming.map((o) => (
                <Link
                  key={o.id}
                  to={o.status === 'PENDING' ? `/producer/fpo/orders/${o.id}/confirm` : '/producer/fpo/orders/incoming'}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.items.map((i) => i.productName).join(', ')} · {o.consumerName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold">{formatPrice(o.totalAmount)}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No incoming orders right now.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/producer/fpo/products"><Package className="h-4 w-4" /> Manage products</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/producer/fpo/products/sell"><PackagePlus className="h-4 w-4" /> Sell to consumers</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/producer/fpo/orders/outgoing"><ShoppingCart className="h-4 w-4" /> Outgoing procurements</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/producer/fpo/payments"><Banknote className="h-4 w-4" /> Payments</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/logistics"><Star className="h-4 w-4" /> Logistics hub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}