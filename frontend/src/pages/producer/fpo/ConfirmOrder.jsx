import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, PackageCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { ConfirmDialog } from '@/components/modals';
import { useToast } from '@/components/ui/toast';
import { Loading, OrderStatusBadge, PaymentStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderTimeline } from '@/components/orders';
import { formatPrice } from '@/utils/formatPrice';
import { formatDateTime } from '@/utils/formatDate';

export default function ConfirmOrder() {
  const { orderId } = useParams();
  const { toast } = useToast();

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [declineOpen, setDeclineOpen] = React.useState(false);

  React.useEffect(() => {
    orderService.getById(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  const advance = async (status, message) => {
    setBusy(true);
    try {
      await orderService.updateStatus(orderId, status, { actor: 'FPO' });
      const updated = await orderService.getById(orderId);
      setOrder(updated);
      toast({ title: 'Order updated', description: message, variant: 'success' });
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading order…" />;
  if (!order) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Order not found.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/producer/fpo/orders/incoming"><ArrowLeft className="h-4 w-4" /> Back to orders</Link>
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
          <CardHeader><CardTitle>Items to fulfil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">{item.productName}</p>
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
            <CardHeader><CardTitle>Buyer & delivery</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order.consumerName}</p>
              <p className="text-xs text-muted-foreground">
                {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
              </p>
              <p className="text-xs text-muted-foreground">Payment: {order.paymentMethod?.replaceAll('_', ' ')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order timeline</CardTitle></CardHeader>
            <CardContent><OrderTimeline order={order} /></CardContent>
          </Card>

          <div className="space-y-2">
            {order.status === 'PENDING' ? (
              <Button className="w-full gap-2" size="lg" disabled={busy} onClick={() => advance('CONFIRMED', 'Order confirmed — the buyer has been notified.')}>
                <CheckCircle2 className="h-4 w-4" /> Confirm order
              </Button>
            ) : null}
            {order.status === 'CONFIRMED' ? (
              <Button className="w-full gap-2" disabled={busy} onClick={() => advance('PROCESSING', 'Order marked as processing.')}>
                <PackageCheck className="h-4 w-4" /> Start processing
              </Button>
            ) : null}
            {['PROCESSING'].includes(order.status) ? (
              <Button variant="outline" className="w-full gap-2" disabled={busy} onClick={() => advance('READY_FOR_SHIPMENT', 'Order is ready for pickup or shipment.')}>
                Mark ready for pickup / shipment
              </Button>
            ) : null}
            {['PENDING', 'CONFIRMED'].includes(order.status) ? (
              <Button
                variant="ghost"
                className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busy}
                onClick={() => setDeclineOpen(true)}
              >
                <Ban className="h-4 w-4" /> Decline order
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        title="Decline this order?"
        description="The buyer will be notified and the order cancelled."
        confirmLabel="Decline order" destructive
        onConfirm={() => advance('CANCELLED', 'Order cancelled and the buyer was notified.')}
      />
    </div>
  );
}