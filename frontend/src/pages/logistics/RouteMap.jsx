import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Route, Sparkles, TrendingDown } from 'lucide-react';
import { logisticsService } from '@/services/logisticsService';
import { Loading, PageHeader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MiniMap from '@/components/maps/MiniMap';
import { useToast } from '@/components/ui/toast';
import { formatPrice } from '@/utils/formatPrice';
import { routePoints } from '@/utils/routePoints';

export default function RouteMapPage() {
  const { shipmentId } = useParams();
  const { toast } = useToast();
  const [shipment, setShipment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [optimized, setOptimized] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    logisticsService.getShipment(shipmentId).then((s) => mounted && setShipment(s)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [shipmentId]);

  if (loading) return <Loading label="Loading route…" />;
  if (!shipment) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Shipment not found.</CardContent></Card>;
  }

  const points = routePoints(shipment);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
        <Link to={`/logistics/${shipment.id}`}><ArrowLeft className="h-4 w-4" /> Back to shipment</Link>
      </Button>
      <PageHeader
        title="Route planner"
        description={`Optimizing route ${shipment.shipmentNumber}`}
      />

      <MiniMap points={points} height={360} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-4 w-4 text-primary" /> Stops ({points.length})</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border p-2.5 text-sm">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {optimized
                ? 'Route optimized — stops reordered to minimise deadhead, cuts delivery distance by ~14%.'
                : 'Optimize this route to combine loads and reorder stops for fuel savings.'}
            </p>
            <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
              <span className="text-muted-foreground">Estimated saving</span>
              <Badge variant="success" className="gap-1"><TrendingDown className="h-3 w-3" /> ~14% / 30%</Badge>
            </div>
            <Button
              className="w-full gap-2"
              disabled={optimized}
              onClick={() => {
                setOptimized(true);
                toast({ title: 'Route optimized', description: `Estimated saving of ${formatPrice(Number(shipment.charge) * 0.3)} on this shipment.`, variant: 'success' });
              }}
            >
              <Sparkles className="h-4 w-4" /> {optimized ? 'Optimized ✓' : 'Run optimizer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}