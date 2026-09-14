import { Link } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { PageHeader, Loading, OrderStatusBadge } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function Orders() {
  const { user } = useAuth();
  const { orders, loading } = useOrders({ role: user.role, userId: user.id });

  const filter = (statuses) => orders?.filter((o) => statuses.includes(o.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My orders"
        description="Track and review everything you have ordered."
        actions={
          <Button asChild>
            <Link to="/marketplace"><PackageCheck className="h-4 w-4" /> Shop more</Link>
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {loading ? (
          <Loading className="mt-6" />
        ) : (
          <>
            <TabsContent value="all">
              <OrderList
                items={filter(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT', 'DELIVERED'])}
                empty="You have not placed any orders yet."
              />
            </TabsContent>
            <TabsContent value="active">
              <OrderList
                items={filter(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'])}
                empty="No active orders."
              />
            </TabsContent>
            <TabsContent value="completed">
              <OrderList
                items={filter(['DELIVERED', 'CANCELLED'])}
                empty="No completed orders yet."
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function OrderList({ items, empty }) {
  if (!items?.length) {
    return (
      <Card className="mt-4">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {items.map((o) => (
        <Card key={o.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{o.orderNumber}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {o.items.map((i) => i.productName).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Placed {formatDate(o.createdAt)} · {o.producerName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold">{formatPrice(o.totalAmount)}</span>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/consumer/orders/${o.id}`}>Track order</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}