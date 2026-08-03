import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { CarFront, ChevronRight, DollarSign, Star, X } from 'lucide-react';
import { getDriverSummary, getPendingRequest, updateAvailability } from '../api/drivers';
import { getTripHistory } from '../api/trips';
import { HeaderActionsPill } from '../components/HeaderActionsPill';
import { LocateMeButton } from '../components/LocateMeButton';
import { MapAutoRecenter } from '../components/MapAutoRecenter';
import { MapResizeObserver } from '../components/MapResizeObserver';
import { sendDriverLocation } from '../api/tracking';
import { getApiStatusCode } from '../api/client';
import { translateAvailabilityError } from '../api/driverErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useDismissedItems } from '../hooks/useDismissedItems';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { useAuth } from '../hooks/useAuth';
import { TRIP_STATUS_COLORS, TRIP_STATUS_LABELS } from '../utils/tripStatusLabels';
import { getGreeting } from '../utils/greeting';
import type { DriverSummary } from '../types/driver';
import type { Trip } from '../types/trip';

const RECENT_TRIPS_LIMIT = 5;

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };
const LOCATE_ZOOM = 16;

export function DriverHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState<DriverSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoadingRecentTrips, setIsLoadingRecentTrips] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { dismissed: dismissedTrips, dismiss: dismissTrip } = useDismissedItems('catrachogo_dismissed_recent_trips');

  const fetchSummary = useCallback(() => {
    getDriverSummary()
      .then((result) => {
        setSummary(result);
        setIsAvailable(result.available);
      })
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

  useEffect(() => {
    getTripHistory(1, RECENT_TRIPS_LIMIT)
      .then((result) => setRecentTrips(result.data))
      .catch(() => {})
      .finally(() => setIsLoadingRecentTrips(false));
  }, []);

  const hasWarnedLocationRef = useRef(false);

  useEffect(() => {
    if (isAvailable) {
      hasWarnedLocationRef.current = false;
    }
  }, [isAvailable]);

  usePolling(
    () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          hasWarnedLocationRef.current = false;
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(coords);
          sendDriverLocation(coords.lat, coords.lng).catch(() => {});
        },
        () => {
          if (!hasWarnedLocationRef.current) {
            hasWarnedLocationRef.current = true;
            toast.error(
              'No podemos obtener tu ubicación. Actívala en el navegador para que los pasajeros puedan encontrarte.',
            );
          }
        },
      );
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

  const { isLoading: isLocating, locate } = useGeolocation();
  const [locateFocusKey, setLocateFocusKey] = useState(0);

  async function handleLocateMe() {
    const here = await locate();
    if (!here) {
      toast.error('No se pudo obtener tu ubicación.');
      return;
    }
    setPosition(here);
    setLocateFocusKey((key) => key + 1);
  }

  const dateLabel = new Date().toLocaleDateString('es-HN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const visibleRecentTrips = recentTrips.filter((trip) => !dismissedTrips.has(trip.id));

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-4 lg:p-8 xl:p-10 dark:bg-gray-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-success/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-md lg:max-w-none">
        <div className="mb-4 flex items-center justify-between gap-2 lg:mb-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-pale text-sm font-bold text-brand shadow-sm ring-2 ring-white dark:bg-brand/15 dark:ring-gray-900">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand">{getGreeting()}</p>
              <p className="truncate text-base font-bold leading-tight text-gray-800 lg:text-lg dark:text-gray-100">{user?.name}</p>
              <p className="truncate text-xs capitalize text-gray-400 dark:text-gray-500">{dateLabel}</p>
            </div>
          </div>
          <HeaderActionsPill
            historyPath="/driver/trips/history"
            walletPath="/driver/wallet"
            profilePath="/driver/profile"
          />
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          <div className="relative mb-4 h-64 overflow-hidden rounded-3xl shadow-md lg:col-span-3 lg:mb-6 lg:h-96 xl:col-span-4 xl:h-[28rem]">
            <GoogleMap
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={14}
              disableDefaultUI
              gestureHandling="greedy"
              className="h-full w-full"
            >
              <MapAutoRecenter position={smoothedPosition} zoom={LOCATE_ZOOM} focusKey={locateFocusKey} />
              <MapResizeObserver />
              {smoothedPosition && <Marker position={smoothedPosition} />}
            </GoogleMap>

            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              className={`absolute left-4 top-4 z-10 flex items-center gap-3 rounded-2xl bg-white/95 py-4 pl-5 pr-4 text-left shadow-lg backdrop-blur-sm transition disabled:opacity-70 dark:bg-gray-900/95 ${
                isAvailable ? 'ring-2 ring-success/40' : ''
              }`}
            >
              <span className="relative flex h-3 w-3 shrink-0">
                {isAvailable && (
                  <>
                    <span className="absolute inset-0 -m-3 rounded-full bg-success/25 animate-radar-pulse" />
                    <span className="absolute inset-0 -m-3 rounded-full bg-success/25 animate-radar-pulse [animation-delay:0.9s]" />
                  </>
                )}
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${isAvailable ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'}`}
                />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-800 dark:text-gray-100">
                  {isAvailable ? 'Estás disponible' : 'No disponible'}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  {isAvailable ? 'Buscando viajes cercanos' : 'Actívate para recibir viajes'}
                </span>
              </span>
              <span
                className={`ml-1 flex h-6 w-10 shrink-0 items-center rounded-full p-1 transition ${
                  isAvailable ? 'justify-end bg-success' : 'justify-start bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-white shadow" />
              </span>
            </button>

            <LocateMeButton isLoading={isLocating} onClick={handleLocateMe} className="absolute bottom-4 right-4" />
          </div>

          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm lg:col-span-1 lg:mb-0 lg:p-5 dark:bg-gray-900">
            <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Resumen de hoy</p>
            <div className="grid grid-cols-3 divide-x divide-gray-100 lg:grid-cols-1 lg:divide-x-0 lg:divide-y dark:divide-gray-800">
              <div className="flex flex-col items-center gap-1.5 px-1 py-2 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-0 lg:py-3 lg:text-left">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success lg:h-10 lg:w-10">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <span className="hidden text-sm font-medium text-gray-600 lg:inline dark:text-gray-300">Ganancias</span>
                </span>
                <span>
                  <span className="block text-lg font-bold tabular-nums text-success lg:text-xl">
                    {isLoadingSummary || !summary ? '...' : `L. ${summary.earningsToday.toFixed(0)}`}
                  </span>
                  <span className="block text-xs text-gray-500 lg:hidden dark:text-gray-400">Ganancias</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 px-1 py-2 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-0 lg:py-3 lg:text-left">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand lg:h-10 lg:w-10 dark:bg-brand/15">
                    <CarFront className="h-4 w-4" />
                  </span>
                  <span className="hidden text-sm font-medium text-gray-600 lg:inline dark:text-gray-300">Viajes</span>
                </span>
                <span>
                  <span className="block text-lg font-bold tabular-nums text-gray-800 lg:text-xl dark:text-gray-100">
                    {isLoadingSummary || !summary ? '...' : summary.tripsToday}
                  </span>
                  <span className="block text-xs text-gray-500 lg:hidden dark:text-gray-400">Viajes</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 px-1 py-2 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:px-0 lg:py-3 lg:text-left">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-500 lg:h-10 lg:w-10 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                  </span>
                  <span className="hidden text-sm font-medium text-gray-600 lg:inline dark:text-gray-300">Calificación</span>
                </span>
                <span>
                  <span className="block text-lg font-bold tabular-nums text-gray-800 lg:text-xl dark:text-gray-100">
                    {isLoadingSummary || !summary ? '...' : summary.averageRating.toFixed(1)}
                  </span>
                  <span className="block text-xs text-gray-500 lg:hidden dark:text-gray-400">Calificación</span>
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-2 lg:p-5 xl:col-span-3 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Últimos viajes</p>
              <Link
                to="/driver/trips/history"
                className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
              >
                Ver todo <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoadingRecentTrips ? (
              <p className="py-2 text-sm text-gray-400 dark:text-gray-500">Cargando...</p>
            ) : recentTrips.length === 0 ? (
              <p className="py-2 text-sm text-gray-400 dark:text-gray-500">Todavía no tienes viajes.</p>
            ) : visibleRecentTrips.length === 0 ? (
              <p className="py-2 text-sm text-gray-400 dark:text-gray-500">Ocultaste todos tus viajes recientes.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 lg:grid lg:grid-cols-2 lg:gap-2 xl:grid-cols-3">
                {visibleRecentTrips.map((trip) => (
                  <li key={trip.id} className="group flex items-center rounded-xl transition hover:bg-cream/70 dark:hover:bg-gray-800">
                    <Link
                      to={`/driver/trips/${trip.id}`}
                      className="-mx-1 flex min-w-0 flex-1 items-center gap-3 px-1 py-2 lg:mx-0 lg:px-2"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TRIP_STATUS_COLORS[trip.status]}`}
                      >
                        <CarFront className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{trip.destinationAddress}</p>
                        {trip.requestedAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(trip.requestedAt).toLocaleDateString('es-HN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TRIP_STATUS_COLORS[trip.status]}`}
                        >
                          {TRIP_STATUS_LABELS[trip.status]}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">L. {trip.fare.toFixed(0)}</span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => dismissTrip(trip.id)}
                      aria-label="Quitar de la vista"
                      className="mr-1 shrink-0 rounded-md p-1.5 text-gray-300 hover:bg-gray-100 hover:text-red-500 dark:text-gray-600 dark:hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
