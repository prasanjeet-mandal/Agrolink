export function routePoints(shipment) {
  const route = shipment?.route ?? [];
  const points = route.map((p, i) => ({
    ...p,
    kind: i === 0 ? 'origin' : i === route.length - 1 ? 'destination' : 'waypoint',
  }));
  if (shipment?.currentLocation) {
    points.push({ ...shipment.currentLocation, kind: 'current', name: shipment.currentLocation.note });
  }
  return points;
}