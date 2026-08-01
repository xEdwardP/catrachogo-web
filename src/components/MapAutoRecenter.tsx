import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { distanceMeters } from '../utils/geo';

const RECENTER_DISTANCE_METERS = 30;

interface MapAutoRecenterProps {
  position: { lat: number; lng: number } | null;
  zoom?: number;
  focusKey?: number;
}

export function MapAutoRecenter({ position, zoom, focusKey }: MapAutoRecenterProps) {
  const map = useMap();
  const lastCenteredRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastFocusKeyRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!map || !position) return;
    const isForcedFocus = focusKey !== undefined && focusKey !== lastFocusKeyRef.current;
    const last = lastCenteredRef.current;
    if (!isForcedFocus && last && distanceMeters(last, position) < RECENTER_DISTANCE_METERS) return;

    lastCenteredRef.current = position;
    lastFocusKeyRef.current = focusKey;
    map.panTo(position);
    if (isForcedFocus && zoom != null) {
      map.setZoom(zoom);
    }
  }, [map, position, zoom, focusKey]);

  return null;
}
