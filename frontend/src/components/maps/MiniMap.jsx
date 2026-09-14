import * as React from 'react';
import L from 'leaflet';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/card';

const KIND_STYLES = {
  origin: { color: '#16a34a', label: 'Origin' },
  current: { color: '#2563eb', label: 'Current location' },
  destination: { color: '#dc2626', label: 'Destination' },
  waypoint: { color: '#d97706', label: 'Waypoint' },
};

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function MiniMap({ points = [], polyline = true, className, height = 280 }) {
  const containerRef = React.useRef(null);
  const signature = JSON.stringify(points);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || points.length === 0) return undefined;

    const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);

    let bounds;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
    } else {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      bounds = L.latLngBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
      map.fitBounds(bounds, { padding: [42, 42] });
    }

    if (polyline && points.length > 1) {
      L.polyline(
        points.map((p) => [p.lat, p.lng]),
        { color: '#2563eb', weight: 3, opacity: 0.85, dashArray: '6 8' }
      ).addTo(map);
    }

    points.forEach((p) => {
      const style = KIND_STYLES[p.kind] ?? KIND_STYLES.waypoint;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.kind === 'current' ? 9 : 7,
        color: '#ffffff',
        weight: 2,
        fillColor: style.color,
        fillOpacity: 1,
      });
      if (p.name) {
        marker.bindPopup(`<b>${style.label}</b><br/>${p.name}`);
      }
      marker.addTo(map);
    });

    const raf = requestAnimationFrame(() => map.invalidateSize());
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, polyline]);

  const kindsInUse = [...new Set(points.map((p) => p.kind))];

  return (
    <Card className={cn('relative w-full overflow-hidden', className)} style={{ height }}>
      {points.length > 0 ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center bg-secondary/40 text-sm text-muted-foreground">
          No route yet for this shipment.
        </div>
      )}

      {points.length > 0 ? (
        <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-wrap gap-2">
          {kindsInUse.map((k) => (
            <span
              key={k}
              className="flex items-center gap-1.5 rounded-full border bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_STYLES[k]?.color }} />
              {KIND_STYLES[k]?.label ?? k}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}