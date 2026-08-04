import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { distanceMeters } from '../utils/geo';

interface LatLng {
  lat: number;
  lng: number;
}

interface DirectionsRoute {
  path: LatLng[] | null;
  distanceText: string | null;
  durationText: string | null;
  durationMinutes: number | null;
}

const EMPTY_ROUTE: DirectionsRoute = {
  path: null,
  distanceText: null,
  durationText: null,
  durationMinutes: null,
};

const RECOMPUTE_DISTANCE_METERS = 120;

export function useDirectionsRoute(
  originLat: number | null | undefined,
  originLng: number | null | undefined,
  destinationLat: number | null | undefined,
  destinationLng: number | null | undefined,
): DirectionsRoute {
  const routesLibrary = useMapsLibrary('routes');
  const [route, setRoute] = useState<DirectionsRoute>(EMPTY_ROUTE);
  const serviceRef = useRef<google.maps.DirectionsService | null>(null);
  const lastOriginRef = useRef<LatLng | null>(null);
  const lastDestinationRef = useRef<LatLng | null>(null);

  useEffect(() => {
    if (!routesLibrary) return;
    serviceRef.current = new routesLibrary.DirectionsService();
  }, [routesLibrary]);

  const hasValidInputs =
    originLat != null && originLng != null && destinationLat != null && destinationLng != null;

  useEffect(() => {
    if (!routesLibrary || !serviceRef.current || !hasValidInputs) {
      lastOriginRef.current = null;
      lastDestinationRef.current = null;
      return;
    }

    const origin = { lat: originLat!, lng: originLng! };
    const destination = { lat: destinationLat!, lng: destinationLng! };

    const lastDestination = lastDestinationRef.current;
    const destinationChanged =
      !lastDestination || lastDestination.lat !== destination.lat || lastDestination.lng !== destination.lng;
    const lastOrigin = lastOriginRef.current;
    const originMoved = !lastOrigin || distanceMeters(lastOrigin, origin) >= RECOMPUTE_DISTANCE_METERS;

    if (!destinationChanged && !originMoved) return;

    lastOriginRef.current = origin;
    lastDestinationRef.current = destination;

    serviceRef.current.route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (response, status) => {
        if (status !== 'OK' || !response?.routes[0]?.legs[0]) {
          return;
        }
        const leg = response.routes[0].legs[0];
        setRoute({
          path: response.routes[0].overview_path.map((point) => ({ lat: point.lat(), lng: point.lng() })),
          distanceText: leg.distance?.text ?? null,
          durationText: leg.duration?.text ?? null,
          durationMinutes: leg.duration ? Math.round(leg.duration.value / 60) : null,
        });
      },
    );
  }, [routesLibrary, hasValidInputs, originLat, originLng, destinationLat, destinationLng]);

  return hasValidInputs ? route : EMPTY_ROUTE;
}
