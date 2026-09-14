import * as React from 'react';
import { Truck, Wrench, CheckCircle2, Bus } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { PageHeader, Loading, StatCard } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BADGE = {
  ASSIGNED: <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Assigned</Badge>,
  AVAILABLE: <Badge variant="default"><Bus className="h-3 w-3" /> Available</Badge>,
  MAINTENANCE: <Badge variant="warning"><Wrench className="h-3 w-3" /> Maintenance</Badge>,
};

export default function VehicleAssignment() {
  const [vehicles, setVehicles] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    logisticsService.getVehicles().then((v) => mounted && setVehicles(v)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Loading label="Loading fleet…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle fleet"
        description="Fleet status for route assignments."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned" value={vehicles.filter((v) => v.status === 'ASSIGNED').length} icon={CheckCircle2} />
        <StatCard label="Available" value={vehicles.filter((v) => v.status === 'AVAILABLE').length} icon={Bus} />
        <StatCard label="In maintenance" value={vehicles.filter((v) => v.status === 'MAINTENANCE').length} icon={Wrench} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v) => (
          <Card key={v.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                {BADGE[v.status] ?? <Badge variant="outline">{v.status}</Badge>}
              </div>
              <h3 className="mt-3 font-bold">{v.type}</h3>
              <p className="text-sm text-muted-foreground">{v.plate}</p>
              <div className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Driver</span>
                  <span className="font-medium text-foreground">{v.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone</span>
                  <span className="font-medium text-foreground">{v.driverPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}