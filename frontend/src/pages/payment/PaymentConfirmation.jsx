import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Package, Receipt } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Loading } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';

export default function PaymentConfirmation() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('order');

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderService.getById(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loading label="Finalizing payment…" />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/orders"><ArrowLeft className="h-4 w-4" /> Back to my orders</Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment successful</h1>
            <p className="text-muted-foreground">Your payment is now in secure escrow.</p>
          </div>

          <div className="w-full max-w-sm space-y-2 rounded-xl border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-semibold">{paymentId ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-semibold">{order?.orderNumber ?? orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-bold">{formatPrice(order?.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-emerald-600">Completed</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild className="gap-2">
              <Link to={`/orders/${order?.id ?? orderId}`}><Package className="h-4 w-4" /> View order</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/payment/history"><Receipt className="h-4 w-4" /> Payment history</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}