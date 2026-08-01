import { useCallback, useState } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  isLoading: boolean;
  locate: () => Promise<LatLng | null>;
}

export function useGeolocation(): UseGeolocationResult {
  const [isLoading, setIsLoading] = useState(false);

  const locate = useCallback((): Promise<LatLng | null> => {
    if (!navigator.geolocation) return Promise.resolve(null);
    setIsLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, []);

  return { isLoading, locate };
}
