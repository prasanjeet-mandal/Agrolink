import * as React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { producerService } from '@/services/producerService';
import { orderService } from '@/services/orderService';
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
    key: 'items', header: 'Procured',
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
];

export default function OutgoingOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    producerService.getProfile(user.id).then((p) => {
      if (!mounted) return;
      orderService.getPurchases(p.id).then((o) => mounted && setOrders(o)).finally(() => mounted && setLoading(false));
    });
    return () => { mounted = false; };
  }, [user.id]);

  const byStatus = (statuses) => orders.filter((o) => statuses.includes(o.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outgoing orders"
        description="Raw produce you have procured from farmers and other FPOs."
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/producer/fpo/products/buy"><ShoppingCart className="h-4 w-4" /> Procure more</Link></Button>}
      />

      {loading ? (
        <Loading label="Fetching procurements…" />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({byStatus(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT']).length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({byStatus(['DELIVERED', 'CANCELLED']).length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <DataTable columns={columns} data={byStatus(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'])} empty={{ title: 'No active procurements', description: 'Place an order from the Buy Products page.' }} />
          </TabsContent>
          <TabsContent value="completed">
            <DataTable columns={columns} data={byStatus(['DELIVERED', 'CANCELLED'])} empty={{ title: 'No completed procurements yet' }} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}