import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Phone, Star, X } from 'lucide-react';
import { cancelTrip, getDriverLocation, getTripDetail } from '../api/trips';
import { getDriverPublicProfile } from '../api/drivers';
import { translateCancelTripError } from '../api/tripErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { RatingModal } from '../components/RatingModal';
import type { TripDetail, TripDriverInfo, TripStatus } from '../types/trip';

interface TripInProgressLocationState {
  originAddress?: string;
  destinationAddress?: string;
  originLat?: number;
  originLng?: number;
}

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };

const STATUS_BANNER: Record<TripStatus, string> = {
  pending: 'Buscando un conductor cercano...',
  accepted: 'Conductor en camino',
  in_progress: 'Viaje en curso',
  completed: 'Viaje completado',
  cancelled: 'Viaje cancelado',
};

export function TripInProgressPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as TripInProgressLocationState | null;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [driver, setDriver] = useState<TripDriverInfo | null>(null);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const fetchedDriverIdRef = useRef<string | null>(null);

  usePolling(
    () => {
      if (!tripId) return;
      getTripDetail(tripId)
        .then((data) => {
          setTrip(data);
          if (data.driver) {
            setDriver(data.driver);
          } else if (data.driverId && fetchedDriverIdRef.current !== data.driverId) {
            fetchedDriverIdRef.current = data.driverId;
            getDriverPublicProfile(data.driverId)
              .then(setDriver)
              .catch(() => {});
          }
        })
        .catch(() => {});
    },
    4000,
    Boolean(tripId),
  );

  const isTrackable = trip?.status === 'accepted' || trip?.status === 'in_progress';
  usePolling(
    () => {
      if (!tripId) return;
      getDriverLocation(tripId)
        .then((loc) => {
          if (loc) setDriverPosition({ lat: loc.lat, lng: loc.lng });
        })
        .catch(() => {});
    },
    4000,
    Boolean(tripId) && isTrackable,
  );

  async function handleCancel() {
    if (!tripId) return;
    setIsCancelling(true);
    try {
      await cancelTrip(tripId);
      toast.success('Viaje cancelado.');
      navigate('/passenger');
    } catch (error) {
      toast.error(translateCancelTripError(error));
    } finally {
      setIsCancelling(false);
    }
  }

  const smoothedDriverPosition = useSmoothedPosition(driverPosition, 3500);

  if (!tripId) {
    return null;
  }

  const bannerText = trip ? STATUS_BANNER[trip.status] : 'Cargando...';
  const canCall = Boolean(trip?.driverPhone);
  const destinationAddress = trip?.destinationAddress ?? state?.destinationAddress ?? '';
  const fallbackCenter =
    state?.originLat !== undefined && state?.originLng !== undefined
      ? { lat: state.originLat, lng: state.originLng }
      : DEFAULT_CENTER;
  const mapCenter = smoothedDriverPosition ?? fallbackCenter;
  const canCancel = trip?.status === 'pending' || trip?.status === 'accepted';
  const shouldShowRating =
    !ratingDismissed && trip?.status === 'completed' && Boolean(driver?.userId) && trip?.ratedByMe === false;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 z-10 p-3 text-center text-sm font-semibold text-white ${
          trip?.status === 'cancelled' ? 'bg-gray-500' : 'bg-success'
        }`}
      >
        {bannerText}
      </div>

      <GoogleMap center={mapCenter} zoom={14} onCameraChanged={() => {}} disableDefaultUI className="h-full w-full">
        {smoothedDriverPosition && <Marker position={smoothedDriverPosition} />}
      </GoogleMap>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400">
              {driver ? driver.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{driver?.name ?? 'Esperando conductor'}</p>
              {driver?.vehicle && (
                <p className="text-xs text-gray-500">
                  {driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.plate}
                </p>
              )}
            </div>
            {driver && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {driver.averageRating.toFixed(1)}
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500">DESTINO</p>
            <p className="text-sm text-gray-800">{destinationAddress || '—'}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling || !canCancel}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
            <a
              href={canCall ? `tel:${trip?.driverPhone}` : undefined}
              aria-disabled={!canCall}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white ${
                canCall ? 'bg-brand hover:bg-brand-dark' : 'pointer-events-none bg-gray-300'
              }`}
            >
              <Phone className="h-4 w-4" /> Llamar
            </a>
          </div>
        </div>
      </div>

      {shouldShowRating && driver?.userId && (
        <RatingModal
          tripId={tripId}
          ratedId={driver.userId}
          ratedName={driver?.name}
          onDone={() => {
            setRatingDismissed(true);
            navigate('/passenger/trips/history');
          }}
        />
      )}
    </div>
  );
}
