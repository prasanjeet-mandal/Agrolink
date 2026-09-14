import * as React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPinned, PackageCheck, Truck, Clock } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { PageHeader, Loading, StatCard, OrderStatusBadge } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/utils/formatDate';

const ACTIVE = ['IN_TRANSIT', 'READY_FOR_SHIPMENT', 'PENDING'];

function routeLabel(shipment) {
  const from = shipment.route?.[0]?.name?.split('—')[1]?.trim() ?? shipment.route?.[0]?.name ?? 'Origin';
  const to = shipment.route?.[shipment.route.length - 1]?.name?.split('—')[1]?.trim() ?? shipment.route?.[shipment.route.length - 1]?.name ?? 'Destination';
  return `${from} → ${to}`;
}

export default function LogisticsDashboard() {
  const [shipments, setShipments] = React.useState(null);
  const [vehicles, setVehicles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([logisticsService.getShipments(), logisticsService.getVehicles().catch(() => [])])
      .then(([s, v]) => {
        if (!mounted) return;
        setShipments(s);
        setVehicles(v);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Loading label="Loading logistics…" />;

  const inTransit = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const ready = shipments.filter((s) => s.status === 'READY_FOR_SHIPMENT').length;
  const assigned = vehicles.filter((v) => v.status === 'ASSIGNED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics hub"
        description="Track shipments and manage your fleet."
        actions={<Button asChild variant="outline" className="gap-2"><Link to="/logistics/vehicles"><Truck className="h-4 w-4" /> Vehicle fleet</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active shipments" value={shipments.filter((s) => ACTIVE.includes(s.status)).length} icon={PackageCheck} />
        <StatCard label="In transit" value={inTransit} icon={Bus} />
        <StatCard label="Ready to load" value={ready} icon={MapPinned} />
        <StatCard label="Vehicles assigned" value={assigned} icon={Truck} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active ({shipments.filter((s) => ACTIVE.includes(s.status)).length})</TabsTrigger>
              <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <ShipmentTable shipments={shipments.filter((s) => ACTIVE.includes(s.status))} />
            </TabsContent>
            <TabsContent value="all">
              <ShipmentTable shipments={shipments} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ShipmentTable({ shipments }) {
  if (!shipments.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No shipments in this view.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="py-3 pr-3">Shipment</th>
            <th className="py-3 pr-3">Route</th>
            <th className="py-3 pr-3">Vehicle</th>
            <th className="py-3 pr-3">ETA</th>
            <th className="py-3 pr-3">Status</th>
            <th className="py-3 pr-3">Charge</th>
            <th className="py-3" />
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="py-3 pr-3">
                <p className="font-semibold">{s.shipmentNumber}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Order {s.orderId}</p>
              </td>
              <td className="py-3 pr-3 text-muted-foreground">{routeLabel(s)}</td>
              <td className="py-3 pr-3">
                <p>{s.vehicle?.type}</p>
                <p className="text-xs text-muted-foreground">{s.vehicle?.plate}</p>
              </td>
              <td className="py-3 pr-3 text-muted-foreground">{s.eta ? formatDateTime(s.eta) : '—'}</td>
              <td className="py-3 pr-3"><OrderStatusBadge status={s.status} /></td>
              <td className="py-3 pr-3 text-muted-foreground">₹{s.charge}</td>
              <td className="py-3 text-right">
                <Button asChild size="sm" variant="outline" className="gap-1">
                  <Link to={`/logistics/${s.id}`}><Bus className="h-3.5 w-3.5" /> Track</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}