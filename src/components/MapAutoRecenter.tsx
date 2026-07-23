import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { distanceMeters } from '../utils/geo';

const RECENTER_DISTANCE_METERS = 30;

interface MapAutoRecenterProps {
  position: { lat: number; lng: number } | null;
}

export function MapAutoRecenter({ position }: MapAutoRecenterProps) {
  const map = useMap();
  const lastCenteredRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!map || !position) return;
    const last = lastCenteredRef.current;
    if (last && distanceMeters(last, position) < RECENTER_DISTANCE_METERS) return;
    lastCenteredRef.current = position;
    map.panTo(position);
  }, [map, position]);

  return null;
}
