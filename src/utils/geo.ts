interface LatLng {
  lat: number;
  lng: number;
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const earthRadiusMeters = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export function isPlausibleMovement(
  previous: LatLng & { timestampMs: number },
  next: LatLng & { timestampMs: number },
  maxSpeedKmh = 140,
): boolean {
  const elapsedHours = (next.timestampMs - previous.timestampMs) / 3_600_000;
  if (elapsedHours <= 0) return true;
  const impliedSpeedKmh = distanceMeters(previous, next) / 1000 / elapsedHours;
  return impliedSpeedKmh <= maxSpeedKmh;
}

export function boundsWithPadding(points: LatLng[], paddingKm: number) {
  const latPad = paddingKm / 111;
  const lngPad = paddingKm / (111 * Math.cos((points[0].lat * Math.PI) / 180) || 1);
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    north: Math.max(...lats) + latPad,
    south: Math.min(...lats) - latPad,
    east: Math.max(...lngs) + lngPad,
    west: Math.min(...lngs) - lngPad,
  };
}
