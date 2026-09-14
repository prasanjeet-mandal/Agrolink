import { Link } from 'react-router-dom';
import { ListOrdered, PackageCheck, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { PageHeader, Loading, OrderStatusBadge, PaymentStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

const STATUS_GROUPS = {
  active: ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'],
  completed: ['DELIVERED', 'CANCELLED'],
};

export default function OrderHistory() {
  const { user } = useAuth();
  const { orders, loading } = useOrders({ role: user.role, userId: user.id });

  const badge = (o) => (
    <div className="flex gap-2">
      <OrderStatusBadge status={o.status} />
      <PaymentStatusBadge status={o.paymentStatus} />
    </div>
  );

  const columns = [
    {
      key: 'orderNumber', header: 'Order',
      render: (o) => (
        <div>
          <p className="font-semibold">{o.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'party', header: user.role === ROLES.CONSUMER ? 'Seller' : 'Buyer',
      render: (o) => (
        <span className="text-sm text-muted-foreground">
          {user.role === ROLES.CONSUMER ? o.items[0]?.producerName : o.consumerName}
        </span>
      ),
    },
    {
      key: 'items', header: 'Items',
      render: (o) => (
        <span className="text-xs text-muted-foreground">
          {o.items.map((i) => `${i.productName} ×${i.quantity}${i.unit}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'totalAmount', header: 'Amount', className: 'text-right',
      render: (o) => <span className="font-semibold">{formatPrice(o.totalAmount)}</span>,
    },
    { key: 'status', header: 'Status', render: (o) => badge(o) },
    {
      key: 'action', header: '',
      render: (o) => (
        <div className="flex gap-1">
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to={`/orders/${o.id}`}><ListOrdered className="h-3.5 w-3.5" /> Details</Link>
          </Button>
          {['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'].includes(o.status) ? (
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link to={`/orders/${o.id}/track`}><Truck className="h-3.5 w-3.5" /> Track</Link>
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const byStatus = (key) => (orders ?? []).filter((o) => STATUS_GROUPS[key].includes(o.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My orders"
        description={user.role === ROLES.CONSUMER
          ? 'Everything you have ordered.'
          : 'Orders on your produce, across all stages.'}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to="/marketplace"><PackageCheck className="h-4 w-4" /> Shop more</Link>
          </Button>
        }
      />

      {loading ? (
        <Loading label="Fetching orders…" />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({byStatus('active').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({byStatus('completed').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <DataTable
              columns={columns}
              data={byStatus('active')}
              empty={{ title: 'No active orders', description: 'Your active orders will appear here.' }}
            />
          </TabsContent>
          <TabsContent value="completed">
            <DataTable
              columns={columns}
              data={byStatus('completed')}
              empty={{ title: 'No completed orders yet' }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}