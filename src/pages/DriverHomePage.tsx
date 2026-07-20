import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Clock, LogOut, Star, Wallet } from 'lucide-react';
import { getDriverSummary, getPendingRequest, updateAvailability } from '../api/drivers';
import { sendDriverLocation } from '../api/tracking';
import { getApiStatusCode } from '../api/client';
import { translateAvailabilityError } from '../api/driverErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { useAuth } from '../hooks/useAuth';
import type { DriverSummary } from '../types/driver';

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };

export function DriverHomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState<DriverSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const fetchSummary = useCallback(() => {
    getDriverSummary()
      .then(setSummary)
      .catch((error) => {
        if (getApiStatusCode(error) === 403) {
          navigate('/driver/complete-profile', { replace: true });
          return;
        }
        toast.error('No se pudo cargar el resumen de hoy.');
      })
      .finally(() => setIsLoadingSummary(false));
  }, [navigate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  usePolling(
    () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        sendDriverLocation(coords.lat, coords.lng).catch(() => {});
      });
    },
    5000,
    isAvailable,
  );

  usePolling(
    () => {
      getPendingRequest()
        .then((request) => {
          if (request) {
            navigate(`/driver/requests/${request.id}`, { state: request });
          }
        })
        .catch(() => {});
    },
    4000,
    isAvailable,
  );

  async function handleToggleAvailability() {
    const nextAvailable = !isAvailable;
    setIsTogglingAvailability(true);
    try {
      const result = await updateAvailability(nextAvailable);
      setIsAvailable(result.available);
    } catch (error) {
      toast.error(translateAvailabilityError(error));
    } finally {
      setIsTogglingAvailability(false);
    }
  }

  const smoothedPosition = useSmoothedPosition(position, 3000);
  const mapCenter = smoothedPosition ?? DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-pale text-sm font-bold text-brand shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-500">Hola,</p>
              <p className="font-semibold text-gray-800">{user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2 rounded-lg bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => navigate('/driver/trips/history')}
              aria-label="Historial de viajes"
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <Clock className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/driver/wallet')}
              aria-label="Wallet"
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <Wallet className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión"
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAvailability}
          disabled={isTogglingAvailability}
          className={`mb-4 flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-sm transition ${
            isAvailable
              ? 'bg-gradient-to-r from-success to-success-dark text-white shadow-success/20'
              : 'bg-white text-gray-800'
          } disabled:opacity-70`}
        >
          <div>
            <p className="font-semibold">
              {isAvailable ? 'Estás disponible' : 'No estás disponible'}
            </p>
            <p className={`text-xs ${isAvailable ? 'text-white/80' : 'text-gray-500'}`}>
              {isAvailable ? 'Recibiendo solicitudes cercanas' : 'Actívate para recibir viajes'}
            </p>
          </div>
          <span
            className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
              isAvailable ? 'justify-end bg-white/30' : 'justify-start bg-gray-200'
            }`}
          >
            <span className={`h-5 w-5 rounded-full ${isAvailable ? 'bg-white' : 'bg-white shadow'}`} />
          </span>
        </button>

        <p className="mb-2 text-sm font-semibold text-gray-700">Resumen de hoy</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-success">
              {isLoadingSummary || !summary ? '...' : `L. ${summary.earningsToday.toFixed(0)}`}
            </p>
            <p className="text-xs text-gray-500">Ganancias</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-800">
              {isLoadingSummary || !summary ? '...' : summary.tripsToday}
            </p>
            <p className="text-xs text-gray-500">Viajes</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="flex items-center justify-center gap-1 text-lg font-bold text-gray-800">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {isLoadingSummary || !summary ? '...' : summary.averageRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Calificación</p>
          </div>
        </div>

        <div className="relative h-64 overflow-hidden rounded-2xl shadow-sm">
          <GoogleMap
            center={mapCenter}
            zoom={14}
            onCameraChanged={() => {}}
            disableDefaultUI
            className="h-full w-full"
          >
            {smoothedPosition && <Marker position={smoothedPosition} />}
          </GoogleMap>
          {isAvailable && (
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-success shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Buscando viajes cercanos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
