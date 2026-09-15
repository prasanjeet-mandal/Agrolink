import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, MapPinned, Package, PackageX, Store, Timer, Truck } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { Loading, LogisticsStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrackMap from '@/components/maps/TrackMap';
import { useToast } from '@/components/ui/toast';
import { LOGISTICS_STATUS, LOGISTICS_STATUS_LABELS } from '@/constants/logisticsStatus';
import { formatDateTime } from '@/utils/formatDate';
import { formatPrice } from '@/utils/formatPrice';

const NEXT_ACTION = {
  [LOGISTICS_STATUS.CREATED]: { next: LOGISTICS_STATUS.PICKED_UP, label: 'Mark picked up' },
  [LOGISTICS_STATUS.ASSIGNED]: { next: LOGISTICS_STATUS.PICKED_UP, label: 'Mark picked up' },
  [LOGISTICS_STATUS.PICKED_UP]: { next: LOGISTICS_STATUS.IN_TRANSIT, label: 'Start in transit' },
  [LOGISTICS_STATUS.IN_TRANSIT]: { next: LOGISTICS_STATUS.DELIVERED, label: 'Mark delivered' },
  [LOGISTICS_STATUS.OUT_FOR_DELIVERY]: { next: LOGISTICS_STATUS.DELIVERED, label: 'Mark delivered' },
};

const STEPS = [
  LOGISTICS_STATUS.ASSIGNED,
  LOGISTICS_STATUS.PICKED_UP,
  LOGISTICS_STATUS.IN_TRANSIT,
  LOGISTICS_STATUS.DELIVERED,
];

export default function ActiveDelivery() {
  const { deliveryId } = useParams();
  const { toast } = useToast();
  const [delivery, setDelivery] = React.useState(null);
  const [shipment, setShipment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updating, setUpdating] = React.useState(false);
  const [locationStatus, setLocationStatus] = React.useState('idle');
  const [locationMessage, setLocationMessage] = React.useState('');

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

  React.useEffect(() => {
    if (delivery) {
      logisticsService.getShipment(delivery.id).then(setShipment).catch(() => setShipment(null));
    } else {
      setShipment(null);
    }
  }, [delivery]);

  const activeId = delivery?.id ?? deliveryId;
  const deliveryStatus = delivery?.status;
  const trackable = deliveryStatus !== LOGISTICS_STATUS.DELIVERED && deliveryStatus !== LOGISTICS_STATUS.CANCELLED;

  React.useEffect(() => {
    if (activeId == null || !trackable) {
      setLocationStatus('idle');
      setLocationMessage('');
      return undefined;
    }
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      setLocationMessage('This device or browser does not support location sharing.');
      return undefined;
    }

    let stopped = false;
    let timer = null;

    const send = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (stopped) return;
          setLocationStatus('active');
          setLocationMessage('Sharing your live location with the buyer.');
          try {
            await logisticsService.updateLocation(activeId, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            logisticsService.getShipment(activeId).then(setShipment).catch(() => null);
          } catch {
            setLocationMessage('Live location is on but the update could not be saved right now.');
          }
        },
        (err) => {
          if (stopped) return;
          if (err.code === err.PERMISSION_DENIED) {
            setLocationStatus('denied');
            setLocationMessage('Location permission was denied. You can continue the delivery and update status manually.');
          } else {
            setLocationStatus('retrying');
            setLocationMessage('Location is temporarily unavailable — retrying.');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    };

    send();
    timer = setInterval(send, 30000);

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, [activeId, deliveryStatus, trackable]);

  const advance = async () => {
    if (!delivery) return;
    const action = NEXT_ACTION[delivery.status];
    if (!action) return;
    setUpdating(true);
    try {
      const updated = await logisticsService.updateStatus(delivery.id, action.next);
      setDelivery((prev) => ({ ...prev, status: updated.status }));
      toast({
        title: 'Status updated',
        description: `Delivery #${delivery.id} → ${LOGISTICS_STATUS_LABELS[action.next] ?? action.next}`,
        variant: 'success',
      });
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading label="Loading active delivery…" />;

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

  const action = NEXT_ACTION[delivery.status];
  const activeIndex = STEPS.indexOf(delivery.status);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to={`/delivery-partner/deliveries/${delivery.id}`}>
          <ArrowLeft className="h-4 w-4" /> Back to delivery
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{delivery.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Delivery #{delivery.id} — active delivery</p>
        </div>
        <LogisticsStatusBadge status={delivery.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4 text-primary" /> Delivery progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((step, index) => {
              const reached = index <= activeIndex || delivery.status === LOGISTICS_STATUS.DELIVERED;
              const isCurrent = delivery.status !== LOGISTICS_STATUS.DELIVERED && index === activeIndex;
              return (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className={
                      reached
                        ? 'flex h-6 items-center gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary'
                        : 'flex h-6 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground'
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {LOGISTICS_STATUS_LABELS[step] ?? step}
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span className="h-px w-4 bg-border" aria-hidden="true" />
                  ) : null}
                  {isCurrent ? <Badge variant="outline">Current</Badge> : null}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <TrackMap shipment={shipment ?? {}} height={300} />

      {locationStatus === 'active' ? (
        <p className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <MapPinned className="h-4 w-4" /> {locationMessage}
        </p>
      ) : locationStatus === 'retrying' ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <MapPinned className="h-4 w-4" /> {locationMessage}
        </p>
      ) : locationStatus === 'denied' || locationStatus === 'unsupported' ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <MapPinned className="h-4 w-4" /> {locationMessage}
        </p>
      ) : null}

      {action ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Next step</p>
              <p className="text-xs text-muted-foreground">
                Current status: <span className="font-semibold text-foreground">{LOGISTICS_STATUS_LABELS[delivery.status] ?? delivery.status}</span>
              </p>
            </div>
            <Button className="gap-2" onClick={advance} disabled={updating}>
              <Truck className="h-4 w-4" />
              {updating ? 'Updating…' : action.label}
            </Button>
          </CardContent>
        </Card>
      ) : delivery.status === LOGISTICS_STATUS.DELIVERED ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Delivered successfully. The buyer has been notified.
        </p>
      ) : delivery.status === LOGISTICS_STATUS.CANCELLED ? (
        <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <PackageX className="h-4 w-4" /> This delivery was rejected. No further actions available.
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /> Pickup</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{delivery.pickupLocation}</p>
            <p className="text-xs text-muted-foreground">Pick up the packed order here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Deliver to</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{delivery.deliveryLocation}</p>
            {delivery.deliveryAddress?.line1 ? (
              <p className="text-xs text-muted-foreground">
                {delivery.deliveryAddress.line1}, {delivery.deliveryAddress.city} — {delivery.deliveryAddress.pincode}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">{delivery.buyerName || 'Buyer'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold">{delivery.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{delivery.items.map((i) => `${i.productName} ×${i.quantity}${i.unit}`).join(', ')}</p>
            <p className="text-xs font-bold">{formatPrice(delivery.totalAmount)}</p>
            {delivery.createdAt ? (
              <p className="text-xs text-muted-foreground">Ordered {formatDateTime(delivery.createdAt)}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}