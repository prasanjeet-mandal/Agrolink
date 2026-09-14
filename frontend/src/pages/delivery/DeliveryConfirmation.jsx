import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, PackageCheck, PartyPopper, ShieldCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/components/ui/toast';
import { Loading, OrderStatusBadge, PaymentStatusBadge, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { formatDateTime } from '@/utils/formatDate';

export default function DeliveryConfirmation() {
  const { orderId } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [confirmed, setConfirmed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    orderService.getById(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  const confirm = async () => {
    setBusy(true);
    try {
      const updated = await orderService.updateStatus(orderId, 'DELIVERED', { actor: 'Buyer' });
      setOrder(updated);
      if (updated.paymentStatus === 'PENDING' && updated.paymentMethod !== 'COD') {
        const payment = await paymentService.create({
          orderId: updated.id,
          orderNumber: updated.orderNumber,
          consumerId: updated.consumerId,
          producerId: updated.items[0]?.producerId,
          amount: updated.totalAmount,
          method: 'ESCROW_RELEASE',
          status: 'RELEASED',
          note: 'Escrow released on delivery confirmation',
        });
        await paymentService.verify(payment.id).catch(() => null);
      }
      setConfirmed(true);
      toast({
        title: 'Delivery confirmed 🎉',
        description: updated.paymentMethod === 'COD'
          ? `${formatPrice(updated.totalAmount)} handed over to the producer.`
          : 'Escrow released to the producer. Settlement is on the way.',
        variant: 'success',
      });
    } catch (err) {
      toast({ title: 'Could not confirm delivery', description: err.message, variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading delivery…" />;
  if (!order) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Order not found.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/delivery"><ArrowLeft className="h-4 w-4" /> Back to deliveries</Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Confirm delivery</h1>
          <p className="text-sm text-muted-foreground">{order.orderNumber} · {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items received</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-3">
                <ProductImage productId={item.productId} icon={item.icon} name={item.productName} className="h-12 w-12 rounded-md" textClassName="text-xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} × {formatPrice(item.pricePerUnit)}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {order.paymentMethod === 'COD'
                  ? 'Cash on delivery — hand payment to the driver.'
                  : 'Your payment is held in escrow. It releases to the producer the moment you confirm delivery.'}
              </div>
              {!confirmed && order.status === 'IN_TRANSIT' ? (
                <Button className="w-full gap-2" size="lg" disabled={busy} onClick={confirm}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {busy ? 'Confirming…' : 'Confirm delivery & release payment'}
                </Button>
              ) : null}
              {confirmed || order.status === 'DELIVERED' ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
                  <PartyPopper className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">Delivered & settled</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <PackageCheck className="h-3.5 w-3.5" /> Producer was paid
                  </p>
                </div>
              ) : null}
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link to={`/orders/${order.id}/track`}>View full order</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}