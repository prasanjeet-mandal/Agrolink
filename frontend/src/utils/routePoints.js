const hasCoords = (p) =>
  p != null && p.lat != null && p.lng != null && !Number.isNaN(Number(p.lat)) && !Number.isNaN(Number(p.lng));

export function routePoints(shipment) {
  const route = (shipment?.route ?? []).filter(hasCoords);
  const points = route.map((p, i) => ({
    ...p,
    lat: Number(p.lat),
    lng: Number(p.lng),
    kind: i === 0 ? 'origin' : i === route.length - 1 ? 'destination' : 'waypoint',
  }));
  if (shipment?.currentLocation && hasCoords(shipment.currentLocation)) {
    points.push({
      ...shipment.currentLocation,
      lat: Number(shipment.currentLocation.lat),
      lng: Number(shipment.currentLocation.lng),
      kind: 'current',
      name: shipment.currentLocation.name ?? 'Current location',
    });
  }
  return points;
}