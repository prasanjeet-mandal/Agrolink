import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Landmark, Loader2, Lock, QrCode, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/components/ui/toast';
import { Loading, OrderStatusBadge, PaymentStatusBadge, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';

const METHODS = [
  { id: 'UPI', label: 'UPI', icon: QrCode, hint: 'GPay, PhonePe, Paytm' },
  { id: 'CARD', label: 'Card', icon: CreditCard, hint: 'Credit / debit' },
  { id: 'NET_BANKING', label: 'Net banking', icon: Landmark, hint: 'All major banks' },
];

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const orderId = searchParams.get('order');
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [method, setMethod] = React.useState('UPI');
  const [upiId, setUpiId] = React.useState(user?.email?.split('@')[0] ? `${user.email.split('@')[0]}@okhdfc` : '');
  const [card, setCard] = React.useState({ number: '', name: '', expiry: '', cvv: '' });
  const [paying, setPaying] = React.useState(false);

  React.useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderService.getById(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loading label="Loading payment…" />;

  if (!order) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No order selected for payment.</p>
          <Button asChild className="mt-4"><Link to="/orders">My orders</Link></Button>
        </CardContent>
      </Card>
    );
  }

  if (order.paymentStatus !== 'PENDING') {
    return (
      <Card>
        <CardContent className="space-y-4 py-16 text-center">
          <p className="text-2xl">✅</p>
          <p className="font-semibold">This order is already {order.paymentStatus.toLowerCase()}.</p>
          <Button asChild><Link to={`/orders/${order.id}`}>View order</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const pay = async () => {
    if (method === 'UPI' && (!upiId || !upiId.includes('@'))) {
      toast({ title: 'Enter a valid UPI ID', variant: 'error' });
      return;
    }
    setPaying(true);
    try {
      const payment = await paymentService.create({
        orderId: order.id,
        orderNumber: order.orderNumber,
        consumerId: order.consumerId ?? user.id,
        producerId: order.items[0]?.producerId,
        amount: order.totalAmount,
        method: method === 'UPI' ? 'UPI' : method === 'CARD' ? 'CARD' : 'NET_BANKING',
        status: 'COMPLETED',
      });
      await orderService.updatePayment(order.id, 'COMPLETED');
      toast({ title: 'Payment successful', description: `${formatPrice(order.totalAmount)} paid for ${order.orderNumber}.`, variant: 'success' });
      navigate(`/payment/confirm?paymentId=${payment.paymentId}&order=${order.id}`);
    } catch (err) {
      toast({ title: 'Payment failed', description: err.message, variant: 'error' });
    } finally {
      setPaying(false);
    }
  };

  const methods = METHODS;
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to={`/orders/${order.id}`}><ArrowLeft className="h-4 w-4" /> Back to order</Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment</h1>
          <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Pay with</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                    method === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
                  )}
                >
                  <m.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.hint}</span>
                </button>
              ))}
            </div>

            <Separator />

            {method === 'UPI' ? (
              <FormField label="UPI ID" hint="We'll show a collect request on your UPI app." htmlFor="upi">
                <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
              </FormField>
            ) : null}

            {method === 'CARD' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Card number" className="sm:col-span-2" htmlFor="cardno">
                  <Input id="cardno" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} />
                </FormField>
                <FormField label="Name on card" htmlFor="cardname">
                  <Input id="cardname" placeholder="Meera Sharma" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Expiry" htmlFor="expiry">
                    <Input id="expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} />
                  </FormField>
                  <FormField label="CVV" htmlFor="cvv">
                    <Input id="cvv" type="password" placeholder="•••" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} />
                  </FormField>
                </div>
              </div>
            ) : null}

            {method === 'NET_BANKING' ? (
              <FormField label="Select your bank" htmlFor="bank">
                <select
                  id="bank"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  defaultValue="HDFC"
                >
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Punjab National Bank</option>
                  <option>Axis Bank</option>
                </select>
              </FormField>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-fit">
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-bold">Amount due</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
              </div>
              <Separator />
              <p className="text-center text-3xl font-extrabold">{formatPrice(order.totalAmount)}</p>
              <p className="text-center text-xs text-muted-foreground">with secure escrow protection</p>
              <div className="space-y-2">
                {order.items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-2 rounded-lg border p-2">
                    <ProductImage productId={i.productId} icon={i.icon} name={i.productName} className="h-10 w-10 rounded-md" textClassName="text-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{i.productName}</p>
                      <p className="text-xs text-muted-foreground">{i.quantity} {i.unit} × {formatPrice(i.pricePerUnit)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full gap-2" size="lg" disabled={paying} onClick={pay}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {paying ? 'Processing…' : `Pay ${formatPrice(order.totalAmount)}`}
              </Button>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                Payment is refundable until you confirm delivery.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}