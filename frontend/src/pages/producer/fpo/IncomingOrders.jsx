import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { PageHeader, Loading, OrderStatusBadge, PaymentStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

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
    key: 'consumerName', header: 'Buyer',
    render: (o) => <span>{o.consumerName}</span>,
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
    render: (o) => <span className="font-medium">{formatPrice(o.totalAmount)}</span>,
  },
  {
    key: 'status', header: 'Status',
    render: (o) => <OrderStatusBadge status={o.status} />,
  },
  {
    key: 'paymentStatus', header: 'Payment',
    render: (o) => <PaymentStatusBadge status={o.paymentStatus} />,
  },
  {
    key: 'action', header: '',
    render: (o) =>
      o.status === 'PENDING' ? (
        <Button asChild size="sm" variant="outline" className="gap-1">
          <Link to={`/producer/fpo/orders/${o.id}/confirm`}>
            <CheckCircle2 className="h-4 w-4" /> Review
          </Link>
        </Button>
      ) : null,
  },
];

export default function IncomingOrders() {
  const { user } = useAuth();
  const { orders, loading } = useOrders({ role: user.role, userId: user.id });

  const byStatus = (statuses) => (orders ?? []).filter((o) => statuses.includes(o.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming orders"
        description="Orders placed on your pooled products. Review new orders first."
      />

      {loading ? (
        <Loading label="Fetching orders…" />
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({byStatus(['PENDING']).length})</TabsTrigger>
            <TabsTrigger value="active">Active ({byStatus(['CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT']).length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({byStatus(['DELIVERED', 'CANCELLED']).length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <DataTable columns={columns} data={byStatus(['PENDING'])} empty={{ title: 'No pending orders', description: 'New orders will appear here for review.' }} />
          </TabsContent>
          <TabsContent value="active">
            <DataTable columns={columns} data={byStatus(['CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'])} empty={{ title: 'No active orders' }} />
          </TabsContent>
          <TabsContent value="completed">
            <DataTable columns={columns} data={byStatus(['DELIVERED', 'CANCELLED'])} empty={{ title: 'No completed orders yet' }} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}