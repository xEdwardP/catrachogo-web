import type { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  if (!googleMapsApiKey) {
    return children;
  }
  return (
    <APIProvider apiKey={googleMapsApiKey} libraries={['places']}>
      {children}
    </APIProvider>
  );
}
