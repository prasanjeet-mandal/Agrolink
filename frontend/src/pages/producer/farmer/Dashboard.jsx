import * as React from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Package, PackagePlus, PackageCheck, Star, TrendingUp } from 'lucide-react';
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
  const [orders, setOrders] = React.useState([]);
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      setProducer(p);
      Promise.all([
        productService.getMine(p.id).catch(() => []),
        producerService.getStats(p.id).catch(() => null),
      ]).then(([pr, s]) => {
        if (!mounted) return;
        setProducts(pr);
        setStats(s);
      });
    });
    orderService.getMine({ role: user.role, userId: user.id })
      .then((o) => mounted && setOrders(o))
      .catch(() => mounted && setOrders([]));
    return () => { mounted = false; };
  }, [user.id, user.role]);

  if (!producer || !stats) return <Loading label="Loading farm dashboard…" />;

  const pendingOrders = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status));
  const activeOrders = orders.filter((o) => ['PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'].includes(o.status));
  const upcoming = [...pendingOrders, ...activeOrders].slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${producer.farmName} 🚜`}
        description={`${producer.location.district}, ${producer.location.state} · land ${producer.landSizeAcres} acres`}
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/producer/farmer/products/add"><PackagePlus className="h-4 w-4" /> Add produce</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/marketplace"><TrendingUp className="h-4 w-4" /> Sell in marketplace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Listings live" value={products.filter((p) => p.status === 'ACTIVE').length} icon={Package} />
        <StatCard label="Pending orders" value={pendingOrders.length} icon={PackageCheck} hint="awaiting your action" />
        <StatCard label="Revenue to date" value={formatPrice(stats.totalRevenue, { compact: true })} icon={Banknote} />
        <StatCard label="Rating" value={stats.avgRating} icon={Star} hint="from buyer reviews" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Orders needing attention</CardTitle>
            <Button asChild variant="link" size="sm" className="p-0">
              <Link to="/producer/farmer/orders/incoming">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length ? (
              upcoming.map((o) => (
                <Link
                  key={o.id}
                  to={o.status === 'PENDING' ? `/producer/farmer/orders/${o.id}/confirm` : '/producer/farmer/orders/incoming'}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.items.map((i) => i.productName).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.consumerName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold">{formatPrice(o.totalAmount)}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No pending orders. List fresh produce to start receiving orders.
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
              <Link to="/producer/farmer/products"><Package className="h-4 w-4" /> Manage my products</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/producer/farmer/payments"><Banknote className="h-4 w-4" /> Payment history</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/pricing"><TrendingUp className="h-4 w-4" /> Check price forecast</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/demand"><PackageCheck className="h-4 w-4" /> Demand forecast</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}