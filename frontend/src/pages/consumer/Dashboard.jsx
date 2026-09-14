import * as React from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, ShoppingBag, Store, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { consumerService } from '@/services/consumerService';
import { PageHeader, Loading, StatCard, OrderStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    consumerService.getDashboard(user.id)
      .then((d) => mounted && setData(d))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user.id]);

  if (loading) return <Loading label="Loading your dashboard…" />;

  const { stats, recentOrders } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user.name.split(' ')[0]} 👋`}
        description="Find fresh produce from verified farms near you."
        actions={
          <Button asChild size="lg" className="gap-2">
            <Link to="/marketplace">
              <Store className="h-4 w-4" /> Browse marketplace
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={stats.orders} icon={ShoppingBag} />
        <StatCard label="Active orders" value={stats.activeOrders} icon={PackageCheck} hint="pending to in-transit" />
        <StatCard label="Delivered" value={stats.delivered} icon={PackageCheck} hint="this period" />
        <StatCard label="Total spent" value={formatPrice(stats.totalSpent)} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Button asChild variant="link" size="sm" className="p-0">
              <Link to="/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length ? (
              recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.items.map((i) => i.productName).join(', ')}
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
                No orders yet. Start shopping in the marketplace.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/pricing"><TrendingUp className="h-4 w-4" /> Price forecast & mandi trends</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/delivery"><PackageCheck className="h-4 w-4" /> Track a delivery</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/consumer/cart"><ShoppingBag className="h-4 w-4" /> View my cart</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <CardContent className="space-y-2 py-6">
              <p className="text-lg font-bold">Save up to 30% buying direct</p>
              <p className="text-sm text-primary-foreground/85">
                Skip APMC mandi middlemen. Order in bulk directly from farmers and FPOs.
              </p>
              <Button asChild variant="secondary" className="mt-1 w-full">
                <Link to="/consumer/search">Start exploring</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}