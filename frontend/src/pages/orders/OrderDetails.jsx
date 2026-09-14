import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { logisticsService } from '@/services/logisticsService';
import { Loading, OrderStatusBadge, PaymentStatusBadge, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderTimeline } from '@/components/orders';
import { ROLES } from '@/constants/roles';
import { formatPrice } from '@/utils/formatPrice';
import { formatDateTime } from '@/utils/formatDate';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [shipment, setShipment] = React.useState(null);

  React.useEffect(() => {
    orderService.getById(orderId).then((o) => {
      setOrder(o);
      logisticsService.getShipmentForOrder(orderId).then((s) => setShipment(s)).catch(() => setShipment(null));
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loading label="Loading order…" />;
  if (!order) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Order not found.</CardContent></Card>;
  }

  const isConsumer = user.role === ROLES.CONSUMER;
  const isSeller = [ROLES.FARMER, ROLES.FPO].includes(user.role);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to={isConsumer ? '/consumer/orders' : '/orders'}>
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-3">
                <Link to={`/marketplace/${item.productId}`}>
                  <ProductImage productId={item.productId} icon={item.icon} name={item.productName} className="h-14 w-14 rounded-md" textClassName="text-2xl" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/marketplace/${item.productId}`} className="text-sm font-semibold hover:underline">{item.productName}</Link>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} × {formatPrice(item.pricePerUnit)}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.total)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Order total</span>
              <span className="font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Delivery address</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order.consumerName}</p>
              <p className="text-xs text-muted-foreground">
                {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
              </p>
              <p className="text-xs text-muted-foreground">Payment: {order.paymentMethod?.replaceAll('_', ' ')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Shipment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {shipment ? (
                <>
                  <p className="font-semibold">{shipment.trackingNumber ?? shipment.shipmentNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {shipment.route?.[0]?.name ?? 'Origin'} → {shipment.route?.[shipment.route.length - 1]?.name ?? 'Destination'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vehicle {shipment.vehicle?.plate} · {shipment.vehicle?.driverName}
                  </p>
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link to={`/logistics/${shipment.id}`}><Package className="h-4 w-4" /> Track shipment</Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {order.status === 'DELIVERED'
                    ? 'Delivered — no active shipment.'
                    : 'A shipment will be assigned once the producer is ready.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><OrderTimeline order={order} /></CardContent>
          </Card>

          <div className="space-y-2">
            {isConsumer && ['PENDING'].includes(order.paymentStatus) && order.paymentMethod !== 'COD' ? (
              <Button asChild className="w-full gap-2">
                <Link to={`/payment?order=${order.id}`}><CreditCard className="h-4 w-4" /> Pay now</Link>
              </Button>
            ) : null}
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'].includes(order.status) ? (
              <Button asChild variant="outline" className="w-full gap-2">
                <Link to={`/orders/${order.id}/track`}><Truck className="h-4 w-4" /> Track delivery</Link>
              </Button>
            ) : null}
            {isSeller && order.status === 'PENDING' ? (
              <Button asChild className="w-full gap-2">
                <Link to={user.role === ROLES.FPO ? `/producer/fpo/orders/${order.id}/confirm` : `/producer/farmer/orders/${order.id}/confirm`}>
                  Review order
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}