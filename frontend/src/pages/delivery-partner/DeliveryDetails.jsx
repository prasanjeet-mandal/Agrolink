import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Package, PackageX, Store, Truck, User } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { useAuth } from '@/hooks/useAuth';
import { Loading, LogisticsStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/modals';
import { useToast } from '@/components/ui/toast';
import { formatDateTime } from '@/utils/formatDate';
import { formatPrice } from '@/utils/formatPrice';

const ACCEPTABLE = ['CREATED', 'ASSIGNED'];
const IN_PROGRESS = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];

export default function DeliveryDetails() {
  const { deliveryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [delivery, setDelivery] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(null);
  const [confirmReject, setConfirmReject] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    logisticsService
      .getMine()
      .then((list) => setDelivery(list.find((d) => String(d.id) === String(deliveryId)) ?? null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deliveryId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    setSubmitting('accept');
    try {
      await logisticsService.assign(Number(deliveryId), user.id);
      toast({ title: 'Delivery accepted', description: `Delivery #${deliveryId} is now yours to complete.`, variant: 'success' });
      navigate(`/delivery-partner/deliveries/${deliveryId}/active`, { replace: true });
    } catch (e) {
      setError(e.message);
      toast({ title: 'Could not accept', description: e.message, variant: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    setSubmitting('reject');
    try {
      await logisticsService.updateStatus(Number(deliveryId), 'CANCELLED');
      toast({ title: 'Delivery rejected', description: `Delivery #${deliveryId} was cancelled.`, variant: 'warning' });
      setConfirmReject(false);
      load();
    } catch (e) {
      toast({ title: 'Could not reject', description: e.message, variant: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <Loading label="Loading delivery…" />;

  if (!delivery) {
    return (
      <Card>
        <CardContent className="space-y-4 py-16 text-center">
          <PackageX className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{error ?? 'Delivery not found or not assigned to you.'}</p>
          <Button asChild variant="outline">
            <Link to="/delivery-partner/deliveries">Back to deliveries</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canAccept = ACCEPTABLE.includes(delivery.status);
  const inProgress = IN_PROGRESS.includes(delivery.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/delivery-partner/deliveries">
          <ArrowLeft className="h-4 w-4" /> Back to deliveries
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{delivery.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Delivery #{delivery.id} · {delivery.createdAt ? formatDateTime(delivery.createdAt) : ''}
          </p>
        </div>
        <LogisticsStatusBadge status={delivery.status} />
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Order details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {delivery.items.length ? (
                delivery.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No product lines recorded.</p>
              )}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">Order total</span>
                <span className="font-bold">{formatPrice(delivery.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" /> Pickup location
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{delivery.pickupLocation}</p>
              <p className="text-xs text-muted-foreground">Collect the order from this pickup point.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Buyer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{delivery.buyerName || 'Buyer'}</p>
              <p className="text-xs text-muted-foreground">Order {delivery.orderId}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{delivery.deliveryLocation}</p>
              {delivery.deliveryAddress?.line1 ? (
                <p className="text-xs text-muted-foreground">
                  {delivery.deliveryAddress.line1}, {delivery.deliveryAddress.city} — {delivery.deliveryAddress.pincode}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {delivery.status === 'DELIVERED' ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> This delivery is complete.
              </p>
            ) : delivery.status === 'CANCELLED' ? (
              <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <PackageX className="h-4 w-4" /> This delivery was rejected. No further action needed.
              </p>
            ) : canAccept ? (
              <>
                <Button className="w-full gap-2" onClick={handleAccept} disabled={submitting === 'accept'}>
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting === 'accept' ? 'Accepting…' : 'Accept delivery'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={() => setConfirmReject(true)}
                  disabled={submitting === 'reject'}
                >
                  <PackageX className="h-4 w-4" /> Reject delivery
                </Button>
              </>
            ) : inProgress ? (
              <Button asChild className="w-full gap-2">
                <Link to={`/delivery-partner/deliveries/${delivery.id}/active`}>
                  <Truck className="h-4 w-4" /> Continue delivery
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject this delivery?"
        description={`Order ${delivery.orderNumber} will be marked as cancelled and removed from your active work.`}
        confirmLabel="Reject delivery"
        cancelLabel="Keep delivery"
        destructive
        loading={submitting === 'reject'}
        onConfirm={handleReject}
      />
    </div>
  );
}