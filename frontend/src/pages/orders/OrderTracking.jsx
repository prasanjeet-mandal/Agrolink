import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { logisticsService } from '@/services/logisticsService';
import { Loading, OrderStatusBadge, PaymentStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderTimeline } from '@/components/orders';
import TrackMap from '@/components/maps/TrackMap';
import { formatPrice } from '@/utils/formatPrice';
import { formatDateTime } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = React.useState(null);
  const [shipment, setShipment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      orderService.getById(orderId),
      logisticsService.getShipmentForOrder(orderId).catch(() => null),
    ])
      .then(([o, s]) => {
        if (!o) return;
        setOrder(o);
        setShipment(s);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loading label="Loading order…" />;
  if (!order) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">Order not found.</CardContent>
      </Card>
    );
  }

  const subtotal = order.subtotal ?? order.items.reduce((sum, i) => sum + i.total, 0);
  const deliveryFee = order.deliveryFee ?? Math.max(0, order.totalAmount - subtotal);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/orders">
          <ArrowLeft className="h-4 w-4" /> Back to my orders
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
        {shipment ? (
          <TrackMap shipment={shipment} className="lg:col-span-2" />
        ) : null}
        <Card className={cn(!shipment && 'lg:col-span-2')}>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} × {formatPrice(item.pricePerUnit)}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee ? formatPrice(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{order.paymentMethod?.replaceAll('_', ' ')}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs">
                  {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>

          {shipment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Shipment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle</span>
                  <Badge variant="outline">{shipment.vehicle?.plate ?? shipment.vehicle?.regNumber}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver</span>
                  <span>{shipment.vehicle?.driverName}</span>
                </div>
                {shipment.eta ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span>{formatDateTime(shipment.eta)}</span>
                  </div>
                ) : null}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/logistics/${shipment.id}`}>View route map</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {order.status === 'IN_TRANSIT' ? (
            <Button asChild className="w-full">
              <Link to={`/delivery/${order.id}/confirm`}>Confirm delivery</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}