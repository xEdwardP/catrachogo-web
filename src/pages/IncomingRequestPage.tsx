import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Star, X } from 'lucide-react';
import { acceptTrip, rejectTrip } from '../api/trips';
import { translateAcceptTripError } from '../api/driverErrorMessages';
import type { PendingTripRequest } from '../types/driver';

const RESPONSE_WINDOW_SECONDS = 20;

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
      navigate(`/driver/trips/${tripId}`, { replace: true });
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
    try {
      await rejectTrip(tripId);
    } catch {
    } finally {
      navigate('/driver', { replace: true });
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F6F1EC] p-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-[#E8532E] px-3 py-1 text-xs font-bold text-white">
              NUEVA SOLICITUD
            </span>
            <span className="text-sm font-medium text-gray-400">{secondsLeft}s</span>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
              {request?.passengerName?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{request?.passengerName ?? 'Pasajero'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {request ? `${request.distanceKm.toFixed(1)} km de distancia` : ''}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-2 rounded-lg bg-[#FDEAE3] px-3 py-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE87]" />
            <div>
              <p className="text-xs font-semibold text-gray-500">RECOGER EN</p>
              <p className="text-sm text-gray-800">{request?.originAddress ?? '—'}</p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">TARIFA</span>
            <span className="text-lg font-bold text-gray-800">
              {request ? `L. ${request.fare.toFixed(2)} · ${request.distanceKm.toFixed(1)} km` : '—'}
            </span>
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
              className="flex-1 rounded-lg bg-[#2DBE87] py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
