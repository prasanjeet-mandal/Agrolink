import { Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { PageHeader, Loading, OrderStatusBadge, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function DeliveryStatus() {
  const { user } = useAuth();
  const { orders, loading } = useOrders({ role: user.role, userId: user.id });

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
      render: (o) => <span className="text-sm text-muted-foreground">{user.role === ROLES.CONSUMER ? o.items[0]?.producerName : o.consumerName}</span>,
    },
    {
      key: 'address', header: 'Delivery to',
      render: (o) => (
        <span className="text-xs text-muted-foreground">
          {o.deliveryAddress?.city}, {o.deliveryAddress?.state} — {o.deliveryAddress?.pincode}
        </span>
      ),
    },
    {
      key: 'totalAmount', header: 'Amount', className: 'text-right',
      render: (o) => <span className="font-semibold">{formatPrice(o.totalAmount)}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'action', header: '',
      render: (o) =>
        o.status === 'IN_TRANSIT' ? (
          <Button asChild size="sm" className="gap-1">
            <Link to={`/delivery/${o.id}/confirm`}><CheckCircle2 className="h-4 w-4" /> Confirm delivery</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link to={`/orders/${o.id}/track`}><Truck className="h-3.5 w-3.5" /> Track</Link>
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery"
        description="Track deliveries and confirm when produce arrives."
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to="/logistics"><PackageCheck className="h-4 w-4" /> Logistics hub</Link>
          </Button>
        }
      />

      <div>
        {loading ? (
          <Loading label="Fetching deliveries…" />
        ) : (
          <DataTable
            columns={columns}
            data={orders ?? []}
            empty={{ title: 'No deliveries yet', description: 'Orders with an active shipment will show up here.' }}
          />
        )}
      </div>
    </div>
  );
}