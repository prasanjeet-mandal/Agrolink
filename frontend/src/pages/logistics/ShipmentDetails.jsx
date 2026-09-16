import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bus, Clock, MapPinned, Phone, Truck } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { orderService } from '@/services/orderService';
import { Loading, OrderStatusBadge } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MiniMap from '@/components/maps/MiniMap';
import { routePoints } from '@/utils/routePoints';
import { formatPrice } from '@/utils/formatPrice';
import { formatDateTime } from '@/utils/formatDate';

export default function ShipmentDetails() {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = React.useState(null);
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    logisticsService.getShipment(shipmentId).then((s) => {
      if (!mounted || !s) return;
      setShipment(s);
      orderService.getById(s.orderId).then((o) => mounted && setOrder(o)).catch(() => setOrder(null));
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [shipmentId]);

  if (loading) return <Loading label="Loading shipment…" />;
  if (!shipment) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Shipment not found.</CardContent></Card>;
  }

  const routeLabel = (s) =>
    `${s.route?.[0]?.name?.split('—')[1]?.trim() ?? s.route?.[0]?.name} → ${s.route?.[s.route.length - 1]?.name?.split('—')[1]?.trim() ?? s.route?.[s.route.length - 1]?.name}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to="/logistics"><ArrowLeft className="h-4 w-4" /> Back to logistics</Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{shipment.shipmentNumber}</h1>
          <p className="text-sm text-muted-foreground">{routeLabel(shipment)}</p>
        </div>
        <OrderStatusBadge status={shipment.status} />
      </div>

      <MiniMap points={routePoints(shipment)} height={300} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{shipment.vehicle?.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number</span>
              <Badge variant="outline">{shipment.vehicle?.plate}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver</span>
              <span>{shipment.vehicle?.driverName}</span>
            </div>
            {shipment.vehicle?.driverPhone ? (
              <Button asChild variant="link" size="sm" className="-ml-2 h-6 gap-1 p-0 text-muted-foreground">
                <a href={`tel:${shipment.vehicle.driverPhone}`}><Phone className="h-3.5 w-3.5" /> {shipment.vehicle.driverPhone}</a>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ETD</span>
              <span>{shipment.etd ? formatDateTime(shipment.etd) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ETA</span>
              <span>{shipment.eta ? formatDateTime(shipment.eta) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Freight charge</span>
              <span className="font-semibold">{formatPrice(shipment.charge)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bus className="h-4 w-4 text-primary" /> Order</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold">{order?.orderNumber ?? shipment.orderId}</p>
            {order ? (
              <>
                <p className="text-xs text-muted-foreground">{order.items.map((i) => `${i.productName} ×${i.quantity}${i.unit}`).join(', ')}</p>
                <p className="text-xs font-bold">{formatPrice(order.totalAmount)}</p>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to={`/orders/${order.id}`}>View order</Link>
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {shipment.currentLocation ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" /> Live location</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">{shipment.currentLocation.name}</p>
            <Button asChild variant="outline" size="sm" className="mt-3 gap-1">
              <Link to={`/logistics/routes/${shipment.id}`}><MapPinned className="h-3.5 w-3.5" /> Open route planner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}