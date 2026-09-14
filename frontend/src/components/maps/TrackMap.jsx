import { Navigation, Truck } from 'lucide-react';
import MiniMap from '@/components/maps/MiniMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { routePoints } from '@/utils/routePoints';
import { formatDateTime } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export default function TrackMap({ shipment, height = 320, className }) {
  const points = routePoints(shipment);
  const origin = points.find((p) => p.kind === 'origin');
  const current = points.find((p) => p.kind === 'current');
  const dest = points.find((p) => p.kind === 'destination');

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Navigation className="h-4 w-4 text-primary" /> Live route
        </CardTitle>
        {current ? (
          <Badge variant="success" className="gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5">
            <Truck className="h-3 w-3" /> {points.length} stops
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <MiniMap points={points} height={height} />

        {points.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              {origin?.name ?? 'Origin'}
            </span>
            {current ? (
              <>
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Navigation className="h-3.5 w-3.5" /> {current.name ?? 'In transit'}
                </span>
              </>
            ) : null}
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              {dest?.name ?? 'Destination'}
            </span>
            {shipment?.eta ? (
              <span className="ml-auto font-semibold text-foreground">ETA {formatDateTime(shipment.eta)}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}