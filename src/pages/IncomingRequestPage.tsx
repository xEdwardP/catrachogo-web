import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Navigation, X } from 'lucide-react';
import { acceptTrip, rejectTrip } from '../api/trips';
import { translateAcceptTripError } from '../api/driverErrorMessages';
import type { PendingTripRequest } from '../types/driver';

const RESPONSE_WINDOW_SECONDS = 20;
const URGENT_THRESHOLD_SECONDS = 5;

export function IncomingRequestPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state as PendingTripRequest | undefined;

  const [secondsLeft, setSecondsLeft] = useState(RESPONSE_WINDOW_SECONDS);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && tripId) {
      rejectTrip(tripId).catch(() => {});
      navigate('/driver', { replace: true });
    }
  }, [secondsLeft, tripId, navigate]);

  if (!tripId) {
    return null;
  }

  async function handleAccept() {
    if (!tripId) return;
    setIsResponding(true);
    try {
      await acceptTrip(tripId);
      navigate(`/driver/trips/${tripId}`, {
        replace: true,
        state: { passengerName: request?.passengerName },
      });
    } catch (error) {
      toast.error(translateAcceptTripError(error));
      navigate('/driver', { replace: true });
    } finally {
      setIsResponding(false);
    }
  }

  async function handleReject() {
    if (!tripId) return;
    setIsResponding(true);
    await rejectTrip(tripId).catch(() => undefined);
    navigate('/driver', { replace: true });
  }

  const isUrgent = secondsLeft <= URGENT_THRESHOLD_SECONDS;

  return (
    <div className="relative min-h-screen bg-cream p-4 lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="mx-auto max-w-md lg:max-w-lg">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="h-1.5 w-full bg-gray-100">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isUrgent ? 'bg-red-500' : 'bg-brand'
              }`}
              style={{ width: `${(secondsLeft / RESPONSE_WINDOW_SECONDS) * 100}%` }}
            />
          </div>

          <div className="p-5 lg:p-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                NUEVA SOLICITUD
              </span>
              <span className={`text-sm font-bold ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
                {secondsLeft}s
              </span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pale text-sm font-bold text-brand">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/20" />
                <span className="relative">{request?.passengerName?.charAt(0).toUpperCase() ?? '?'}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{request?.passengerName ?? 'Pasajero'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Navigation className="h-3 w-3 text-gray-400" />
                  {request ? `${request.distanceKm.toFixed(1)} km de distancia` : ''}
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3">
              <div className="flex items-start gap-2 rounded-lg bg-brand-pale px-3 py-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="text-xs font-semibold text-gray-500">RECOGER EN</p>
                  <p className="text-sm text-gray-800">{request?.originAddress ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-center lg:rounded-lg lg:bg-brand-pale lg:px-3 lg:py-2">
                <span className="text-xs font-semibold text-gray-500">TARIFA</span>
                <span className="text-lg font-bold text-gray-800">
                  {request ? `L. ${request.fare.toFixed(2)} · ${request.distanceKm.toFixed(1)} km` : '—'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={isResponding}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Rechazar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isResponding}
                className="flex-1 rounded-lg bg-success py-2.5 text-sm font-semibold text-white shadow-lg shadow-success/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
