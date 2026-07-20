import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Navigation, Phone } from 'lucide-react';
import { completeTrip, getTripDetail, startTrip } from '../api/trips';
import { sendDriverLocation } from '../api/tracking';
import { translateCompleteTripError, translateStartTripError } from '../api/tripErrorMessages';
import { usePolling } from '../hooks/usePolling';
import type { TripDetail, TripStatus } from '../types/trip';

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };

const STATUS_BANNER: Record<TripStatus, string> = {
  pending: 'Cargando...',
  accepted: 'En camino a recoger al pasajero',
  in_progress: 'Viaje en curso',
  completed: 'Viaje completado',
  cancelled: 'Viaje cancelado',
};

export function DriverTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

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

  if (!tripId) {
    return null;
  }

  async function handleStart() {
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
  const canCall = Boolean(trip?.passengerPhone);
  const mapCenter = position ?? DEFAULT_CENTER;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 bg-[#2DBE87] p-3 text-center text-sm font-semibold text-white">
        {bannerText}
      </div>

      <GoogleMap center={mapCenter} zoom={14} onCameraChanged={() => {}} disableDefaultUI className="h-full w-full">
        {position && <Marker position={position} />}
      </GoogleMap>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl">
          <div className="mb-3 flex items-start gap-2">
            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-[#E8532E]" />
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
                disabled={isUpdatingStatus}
                className="flex-1 rounded-lg bg-[#E8532E] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Llegué, iniciar viaje
              </button>
            )}

            {trip?.status === 'in_progress' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isUpdatingStatus}
                className="flex-1 rounded-lg bg-[#2DBE87] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Completar viaje
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
