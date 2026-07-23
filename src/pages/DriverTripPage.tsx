import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker, Polyline } from '@vis.gl/react-google-maps';
import { Flag, Navigation, Phone } from 'lucide-react';
import { completeTrip, getTripDetail, startTrip } from '../api/trips';
import { sendDriverLocation } from '../api/tracking';
import { translateCompleteTripError, translateStartTripError } from '../api/tripErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { useDirectionsRoute } from '../hooks/useDirectionsRoute';
import { ROUTE_COLOR } from '../utils/mapColors';
import { distanceMeters } from '../utils/geo';
import type { TripDetail, TripStatus } from '../types/trip';

const ARRIVAL_RADIUS_METERS = 150;

interface DriverTripLocationState {
  passengerName?: string;
}

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };

const STATUS_BANNER: Record<TripStatus, string> = {
  pending: 'Cargando...',
  accepted: 'En camino a recoger al pasajero',
  in_progress: 'Viaje en curso',
  completed: 'Viaje completado',
  cancelled: 'Viaje cancelado',
};

const STATUS_ICON: Partial<Record<TripStatus, typeof Navigation>> = {
  accepted: Navigation,
  in_progress: Flag,
};

export function DriverTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as DriverTripLocationState | null;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  usePolling(
    () => {
      if (!tripId) return;
      getTripDetail(tripId)
        .then(setTrip)
        .catch(() => {});
    },
    4000,
    Boolean(tripId),
  );

  const isOnTrip = trip?.status === 'accepted' || trip?.status === 'in_progress';
  usePolling(
    () => {
      if (!tripId || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        sendDriverLocation(coords.lat, coords.lng, tripId).catch(() => {});
      });
    },
    5000,
    Boolean(tripId) && isOnTrip,
  );

  const smoothedPosition = useSmoothedPosition(position, 3000);

  useEffect(() => {
    if (trip?.status === 'cancelled') {
      toast.error('El pasajero canceló el viaje.');
      navigate('/driver', { replace: true });
    }
  }, [trip?.status, navigate]);

  const isPickupPhase = trip?.status === 'accepted';
  const isTripPhase = trip?.status === 'in_progress';
  const routeDestinationLat = isPickupPhase ? trip?.originLat : trip?.destinationLat;
  const routeDestinationLng = isPickupPhase ? trip?.originLng : trip?.destinationLng;
  const route = useDirectionsRoute(
    position?.lat,
    position?.lng,
    isOnTrip ? routeDestinationLat : undefined,
    isOnTrip ? routeDestinationLng : undefined,
  );

  const distanceToTarget =
    position && routeDestinationLat != null && routeDestinationLng != null
      ? distanceMeters(position, { lat: routeDestinationLat, lng: routeDestinationLng })
      : null;
  const isNearTarget = distanceToTarget != null && distanceToTarget <= ARRIVAL_RADIUS_METERS;

  if (!tripId) {
    return null;
  }

  async function handleStart() {
    if (!isNearTarget) {
      toast.error('Debes estar cerca del punto de recogida para iniciar el viaje.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const updated = await startTrip(tripId!);
      setTrip((current) => (current ? { ...current, status: updated.status } : current));
    } catch (error) {
      toast.error(translateStartTripError(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleComplete() {
    if (!isNearTarget) {
      toast.error('Debes estar cerca del destino para completar el viaje.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await completeTrip(tripId!);
      toast.success('Viaje completado. El cobro se aplicó automáticamente.');
      navigate('/driver', { replace: true });
    } catch (error) {
      toast.error(translateCompleteTripError(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const bannerText = trip ? STATUS_BANNER[trip.status] : 'Cargando...';
  const BannerIcon = trip ? STATUS_ICON[trip.status] : undefined;
  const canCall = Boolean(trip?.passengerPhone);
  const mapCenter = smoothedPosition ?? DEFAULT_CENTER;
  const passengerName = state?.passengerName;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 bg-success text-white shadow-md">
        <div className="flex items-center justify-center gap-2 p-3 text-center text-sm font-semibold">
          {BannerIcon && <BannerIcon className="h-4 w-4 shrink-0" />}
          {bannerText}
          {route.durationText && isOnTrip && ` · ${route.durationText}`}
        </div>
        {(isPickupPhase || isTripPhase) && (
          <div className="flex gap-1 px-4 pb-2">
            <span className="h-1 flex-1 rounded-full bg-white" />
            <span className={`h-1 flex-1 rounded-full ${isTripPhase ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        )}
      </div>

      <GoogleMap
        center={mapCenter}
        zoom={14}
        onCameraChanged={() => {}}
        disableDefaultUI
        gestureHandling="greedy"
        className="h-full w-full"
      >
        {route.path && (
          <Polyline path={route.path} strokeColor={ROUTE_COLOR} strokeOpacity={0.9} strokeWeight={4} />
        )}
        {smoothedPosition && <Marker position={smoothedPosition} />}
      </GoogleMap>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl">
          {(isPickupPhase || isTripPhase) && (
            <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pale text-sm font-bold text-brand">
                {passengerName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-xs text-gray-400">Pasajero</p>
                <p className="text-sm font-semibold text-gray-800">{passengerName ?? 'Pasajero'}</p>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-start gap-2">
            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold text-gray-500">
                {trip?.status === 'in_progress' ? 'DESTINO' : 'ORIGEN'}
              </p>
              <p className="text-sm text-gray-800">
                {trip?.status === 'in_progress'
                  ? (trip?.destinationAddress ?? '—')
                  : (trip?.originAddress ?? '—')}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">TARIFA</span>
            <span className="text-sm font-bold text-gray-800">
              {trip ? `L. ${trip.fare.toFixed(2)} · ${trip.distanceKm.toFixed(1)} km` : '—'}
            </span>
          </div>

          <div className="flex gap-3">
            <a
              href={canCall ? `tel:${trip?.passengerPhone}` : undefined}
              aria-disabled={!canCall}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold ${
                canCall
                  ? 'border border-gray-300 text-gray-700'
                  : 'pointer-events-none border border-gray-200 text-gray-400'
              }`}
            >
              <Phone className="h-4 w-4" /> Llamar
            </a>

            {trip?.status === 'accepted' && (
              <button
                type="button"
                onClick={handleStart}
                disabled={isUpdatingStatus || !isNearTarget}
                title={isNearTarget ? undefined : 'Acércate al punto de recogida para habilitar este botón'}
                className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Llegué, iniciar viaje
              </button>
            )}

            {trip?.status === 'in_progress' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isUpdatingStatus || !isNearTarget}
                title={isNearTarget ? undefined : 'Acércate al destino para habilitar este botón'}
                className="flex-1 rounded-lg bg-success py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Completar viaje
              </button>
            )}
          </div>

          {(isPickupPhase || isTripPhase) && !isNearTarget && (
            <p className="mt-2 text-center text-xs text-gray-400">
              {isPickupPhase
                ? 'Acércate al punto de recogida para poder iniciar el viaje.'
                : 'Acércate al destino para poder completar el viaje.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
