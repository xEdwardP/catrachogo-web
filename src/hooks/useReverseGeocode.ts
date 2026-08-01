import { useCallback, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export function useReverseGeocode() {
  const geocodingLibrary = useMapsLibrary('geocoding');
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  return useCallback(
    (lat: number, lng: number): Promise<string | null> => {
      if (!geocodingLibrary) return Promise.resolve(null);
      geocoderRef.current ??= new geocodingLibrary.Geocoder();

      return new Promise((resolve) => {
        geocoderRef.current!.geocode({ location: { lat, lng } }, (results, status) => {
          resolve(status === 'OK' ? (results?.[0]?.formatted_address ?? null) : null);
        });
      });
    },
    [geocodingLibrary],
  );
}
