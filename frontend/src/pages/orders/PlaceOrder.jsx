import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCartContext } from '@/context/CartContext';
import { userService } from '@/services/userService';
import { orderService } from '@/services/orderService';
import { useToast } from '@/components/ui/toast';
import { PageHeader, Loading, EmptyState, ProductImage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms';
import { formatPrice } from '@/utils/formatPrice';
import { validateForm, required } from '@/utils/validation';
import { detectLocation } from '@/utils/geo';

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI (GPay / PhonePe)' },
  { value: 'CARD', label: 'Credit / Debit card' },
  { value: 'NET_BANKING', label: 'Net banking' },
  { value: 'COD', label: 'Cash on delivery' },
];

export default function PlaceOrder() {
  const { user } = useAuth();
  const { items, subtotal, itemCount, clear } = useCartContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [values, setValues] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [detecting, setDetecting] = React.useState(false);
  const [detectMsg, setDetectMsg] = React.useState('');

  const detectDelivery = async () => {
    setDetecting(true);
    setDetectMsg('');
    try {
      const loc = await detectLocation();
      setValues((v) => ({
        ...v,
        line1: loc.line1 || v?.line1 || '',
        city: loc.city || v?.city || '',
        state: loc.state || v?.state || '',
        pincode: loc.pincode || v?.pincode || '',
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      setDetectMsg(
        loc.locationText
          ? `Detected delivery location: ${loc.locationText}`
          : `Detected coordinates: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`
      );
    } catch (err) {
      setDetectMsg(`Could not detect location — ${err.message}`);
    } finally {
      setDetecting(false);
    }
  };

  React.useEffect(() => {
    userService.getProfile(user.id).then((p) => {
      setProfile(p);
      setValues({
        line1: p.profile?.deliveryAddress?.line1 ?? '',
        city: p.profile?.deliveryAddress?.city ?? '',
        state: p.profile?.deliveryAddress?.state ?? '',
        pincode: p.profile?.deliveryAddress?.pincode ?? '',
        paymentMethod: 'UPI',
      });
      setLoading(false);
    });
  }, [user.id]);

  if (loading || !profile) return <Loading label="Preparing checkout…" />;

  if (!items.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Checkout" description="Nothing to order yet." />
        <Card>
          <CardContent>
            <EmptyState
              title="Your cart is empty"
              description="Add produce from the marketplace, then come back to checkout."
              action={<Button asChild><Link to="/marketplace">Browse marketplace</Link></Button>}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliveryFee = subtotal > 5000 ? 0 : subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const rules = {
      line1: (v) => required(v, 'Address line'),
      city: (v) => required(v, 'City'),
      state: (v) => required(v, 'State'),
      pincode: (v) => required(v, 'Pincode'),
    };
    const validation = validateForm(values, rules);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      const order = await orderService.place({
        consumerId: profile.profile?.id ?? user.id,
        consumerName: profile.profile?.fullName ?? profile.name,
        deliveryAddress: {
          line1: values.line1,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          latitude: values.latitude,
          longitude: values.longitude,
        },
        paymentMethod: values.paymentMethod === 'COD' ? 'COD' : values.paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          icon: i.icon,
          unit: i.unit,
          quantity: i.quantity,
          pricePerUnit: i.pricePerUnit,
          producerId: i.producerId,
          total: i.pricePerUnit * i.quantity,
        })),
        totalAmount: total,
      });
      clear();
      toast({
        title: 'Order placed 🎉',
        description: values.paymentMethod === 'COD'
          ? `${order.orderNumber} confirmed. Pay ${formatPrice(total)} on delivery.`
          : `${order.orderNumber} created. Complete payment to finalise.`,
        variant: 'success',
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      toast({ title: 'Could not place order', description: err.message, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/consumer/cart"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
      </Button>
      <PageHeader title="Checkout" description={`Review and place your order of ${itemCount} items.`} />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery address</span>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={detectDelivery} disabled={detecting}>
                  {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {detecting ? 'Detecting…' : 'Detect my location'}
                </Button>
              </CardTitle>
              {detectMsg ? (
                <p className={`text-xs ${detectMsg.startsWith('Could not') ? 'text-red-500' : 'text-emerald-600'}`}>
                  {detectMsg}
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Address line" required error={errors.line1} className="sm:col-span-2" htmlFor="line1">
                <Input id="line1" value={values.line1} onChange={set('line1')} placeholder="House no, street, area" />
              </FormField>
              <FormField label="City" required error={errors.city} htmlFor="city">
                <Input id="city" value={values.city} onChange={set('city')} placeholder="e.g. Delhi" />
              </FormField>
              <FormField label="State" required error={errors.state} htmlFor="state">
                <Input id="state" value={values.state} onChange={set('state')} placeholder="e.g. Delhi" />
              </FormField>
              <FormField label="Pincode" required error={errors.pincode} htmlFor="pincode">
                <Input id="pincode" value={values.pincode} onChange={set('pincode')} placeholder="6 digits" maxLength={6} />
              </FormField>
              <FormField label="Payment method" htmlFor="paymentMethod">
                <Select value={values.paymentMethod} onValueChange={(v) => setValues((s) => ({ ...s, paymentMethod: v }))}>
                  <SelectTrigger id="paymentMethod"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.map((i) => (
                <div key={i.productId} className="flex items-center gap-3 rounded-lg border p-3">
                  <ProductImage productId={i.productId} icon={i.icon} category={i.category} name={i.name} className="h-12 w-12 rounded-md" textClassName="text-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.producerName} · {i.quantity} {i.unit}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(i.pricePerUnit * i.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-fit">
            <CardContent className="space-y-3 pt-6">
              <h3 className="flex items-center gap-2 font-bold"><CreditCard className="h-4 w-4 text-primary" /> Order summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
              </Button>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                Escrow protection — payment to the producer releases only after delivery confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}