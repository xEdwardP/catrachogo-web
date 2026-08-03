import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, DollarSign, MapPin, Navigation, X } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream p-4 lg:p-8 dark:bg-gray-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-success/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
          <div
            className={`relative px-5 py-4 text-white transition-colors duration-500 lg:px-7 ${
              isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-brand to-brand-dark'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                    Nueva solicitud
                  </p>
                  <p className="text-sm font-bold">Tienes un viaje cerca</p>
                </div>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isUrgent ? 'animate-pulse bg-white text-red-600' : 'bg-white/20 text-white'
                }`}
              >
                {secondsLeft}s
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-black/10">
            <div
              className="h-full bg-white/80 transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / RESPONSE_WINDOW_SECONDS) * 100}%` }}
            />
          </div>

          <div className="p-5 lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-pale text-base font-bold text-brand ring-4 ring-brand-pale/60 dark:bg-brand/15 dark:ring-brand/15">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/20" />
                <span className="relative">{request?.passengerName?.charAt(0).toUpperCase() ?? '?'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-800 dark:text-gray-100">
                  {request?.passengerName ?? 'Pasajero'}
                </p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Navigation className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  {request ? `${request.distanceKm.toFixed(1)} km de distancia` : ''}
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 lg:grid lg:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl bg-brand-pale px-3.5 py-3 dark:bg-brand/15">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-brand dark:bg-gray-900/50">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recoger en</p>
                  <p className="truncate text-sm text-gray-800 dark:text-gray-100">{request?.originAddress ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl bg-success/10 px-3.5 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-success dark:bg-gray-900/50">
                  <DollarSign className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tarifa</p>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                    {request ? `L. ${request.fare.toFixed(2)}` : '—'}
                    {request && <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">· {request.distanceKm.toFixed(1)} km</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={isResponding}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" /> Rechazar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isResponding}
                className="flex-1 rounded-xl bg-gradient-to-r from-success to-success-dark py-3 text-sm font-semibold text-white shadow-lg shadow-success/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
