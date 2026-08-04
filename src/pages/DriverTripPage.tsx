import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker, Polyline } from '@vis.gl/react-google-maps';
import { Flag, Home, MapPinCheck, Navigation, Phone } from 'lucide-react';
import { completeTrip, getTripDetail, markDriverArrived, reportNoShow, startTrip } from '../api/trips';
import { sendDriverLocation } from '../api/tracking';
import {
  translateCompleteTripError,
  translateMarkArrivedError,
  translateNoShowError,
  translateStartTripError,
} from '../api/tripErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { useDirectionsRoute } from '../hooks/useDirectionsRoute';
import { ROUTE_COLOR, driverPulseMarkerIcon } from '../utils/mapColors';
import { SIMULATION_STEP_MS } from '../utils/demoSimulation';
import { boundsWithPadding, distanceMeters, isPlausibleMovement } from '../utils/geo';
import { NO_SHOW_GRACE_PERIOD_MS } from '../utils/noShowGracePeriod';
import { LocateMeButton } from '../components/LocateMeButton';
import { MapAutoRecenter } from '../components/MapAutoRecenter';
import { MapResizeObserver } from '../components/MapResizeObserver';
import { ReportNoShowConfirmModal } from '../components/ReportNoShowConfirmModal';
import type { TripDetail, TripStatus } from '../types/trip';

const ARRIVAL_RADIUS_METERS = 150;
const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const LOCATE_ZOOM = 16;
const SIMULATION_MAX_STEPS = 24;

function resamplePath(path: { lat: number; lng: number }[], maxPoints: number): { lat: number; lng: number }[] {
  if (path.length <= maxPoints) return path;
  const step = (path.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => path[Math.round(i * step)]);
}

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
  const [isReportingNoShow, setIsReportingNoShow] = useState(false);
  const [showNoShowConfirm, setShowNoShowConfirm] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [isSimulating, setIsSimulating] = useState(false);
  const [animatingPosition, setAnimatingPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locateFocusKey, setLocateFocusKey] = useState(0);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestampMs: number } | null>(null);
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousStatusRef = useRef<TripStatus | null>(null);

  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

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
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestampMs: Date.now() };
          const last = lastPositionRef.current;
          if (last && !isPlausibleMovement(last, next)) return;
          lastPositionRef.current = next;
          setPosition({ lat: next.lat, lng: next.lng });
          sendDriverLocation(next.lat, next.lng, tripId).catch(() => {});
        },
        undefined,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    },
    5000,
    Boolean(tripId) && isOnTrip && !isSimulating,
  );

  const displayPosition = animatingPosition ?? position;
  const smoothedPosition = useSmoothedPosition(displayPosition, animatingPosition ? SIMULATION_STEP_MS : 3000);

  const { isLoading: isLocating, locate } = useGeolocation();

  async function handleLocateMe() {
    const here = await locate();
    if (!here) {
      toast.error('No se pudo obtener tu ubicación.');
      return;
    }
    setPosition(here);
    setLocateFocusKey((key) => key + 1);
  }

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = trip?.status ?? null;

    const wasJustCancelled = trip?.status === 'cancelled' && previousStatus != null && previousStatus !== 'cancelled';
    if (wasJustCancelled) {
      toast.error('El pasajero canceló el viaje.');
      navigate('/driver', { replace: true });
    }
  }, [trip?.status, navigate]);

  useEffect(() => {
    if (trip?.status !== 'accepted' || !trip.arrivedAt) return;
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [trip?.status, trip?.arrivedAt]);

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

  const zonePoints: { lat: number; lng: number }[] = [];
  if (trip?.originLat != null && trip?.originLng != null) zonePoints.push({ lat: trip.originLat, lng: trip.originLng });
  if (trip?.destinationLat != null && trip?.destinationLng != null) {
    zonePoints.push({ lat: trip.destinationLat, lng: trip.destinationLng });
  }
  if (zonePoints.length === 0) zonePoints.push(DEFAULT_CENTER);
  const zoneRestriction = { latLngBounds: boundsWithPadding(zonePoints, 5), strictBounds: false };

  if (!tripId) {
    return null;
  }

  function handleSimulateArrival() {
    if (routeDestinationLat == null || routeDestinationLng == null || !tripId) return;
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    const destination = { lat: routeDestinationLat, lng: routeDestinationLng };
    const fullPath = route.path && route.path.length > 1 ? route.path : [position ?? destination, destination];
    const steps = resamplePath(fullPath, SIMULATION_MAX_STEPS).slice(1);
    if (steps.length === 0) steps.push(destination);

    setIsSimulating(true);
    let index = 0;

    simulationTimerRef.current = setInterval(() => {
      const point = steps[index];
      setAnimatingPosition(point);
      sendDriverLocation(point.lat, point.lng, tripId).catch(() => {});
      index += 1;

      if (index >= steps.length) {
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
        lastPositionRef.current = { ...destination, timestampMs: Date.now() };
        setAnimatingPosition(null);
        setPosition(destination);
        setIsSimulating(false);
        toast.success('Ubicación simulada en el punto de destino.');
      }
    }, SIMULATION_STEP_MS);
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

  async function handleMarkArrived() {
    if (!isNearTarget) {
      toast.error('Debes estar cerca del punto de recogida para marcar tu llegada.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const updated = await markDriverArrived(tripId!);
      setTrip((current) => (current ? { ...current, arrivedAt: updated.arrivedAt } : current));
    } catch (error) {
      toast.error(translateMarkArrivedError(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleReportNoShow() {
    if (!tripId) return;
    setIsReportingNoShow(true);
    try {
      await reportNoShow(tripId);
      toast.success('Viaje cancelado por no-show. Se aplicó un cargo al pasajero.');
      navigate('/driver', { replace: true });
    } catch (error) {
      toast.error(translateNoShowError(error));
    } finally {
      setIsReportingNoShow(false);
      setShowNoShowConfirm(false);
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
    } catch (error) {
      toast.error(translateCompleteTripError(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const bannerText = trip ? STATUS_BANNER[trip.status] : 'Cargando...';
  const BannerIcon = trip ? STATUS_ICON[trip.status] : undefined;
  const canCall = Boolean(trip?.passengerPhone);
  const passengerName = state?.passengerName;

  const arrivedAtMs = trip?.arrivedAt ? new Date(trip.arrivedAt).getTime() : null;
  const isWaitingForPassenger = trip?.status === 'accepted' && arrivedAtMs != null;
  const elapsedSinceArrivalMs = arrivedAtMs != null ? nowTick - arrivedAtMs : 0;
  const canReportNoShow = isWaitingForPassenger && elapsedSinceArrivalMs >= NO_SHOW_GRACE_PERIOD_MS;
  const remainingMs = Math.max(0, NO_SHOW_GRACE_PERIOD_MS - elapsedSinceArrivalMs);
  const remainingLabel = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative h-full w-full lg:flex-1">
        <div className="absolute inset-x-0 top-0 z-10 bg-success text-white shadow-md lg:hidden">
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
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={14}
          disableDefaultUI
          gestureHandling="greedy"
          restriction={zoneRestriction}
          className="h-full w-full"
        >
          <MapAutoRecenter position={smoothedPosition} zoom={LOCATE_ZOOM} focusKey={locateFocusKey} />
          <MapResizeObserver />
          {route.path && (
            <Polyline path={route.path} strokeColor={ROUTE_COLOR} strokeOpacity={0.9} strokeWeight={4} />
          )}
          {smoothedPosition && <Marker position={smoothedPosition} icon={driverPulseMarkerIcon()} />}
        </GoogleMap>

        {smoothedPosition && (
          <span className="absolute bottom-24 left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm sm:bottom-4 dark:bg-gray-900/95 dark:text-gray-200">
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            Ubicación actual
          </span>
        )}

        <LocateMeButton isLoading={isLocating} onClick={handleLocateMe} className="absolute bottom-24 right-4 sm:bottom-4" />

        {DEMO_MODE_ENABLED && isOnTrip && (
          <button
            type="button"
            onClick={handleSimulateArrival}
            disabled={isSimulating}
            className="absolute bottom-40 right-4 flex items-center gap-1.5 rounded-full bg-gray-800/90 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-16"
          >
            <MapPinCheck className="h-3.5 w-3.5" /> {isSimulating ? 'Simulando...' : 'Simular llegada (demo)'}
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4 lg:static lg:w-[420px] lg:shrink-0 lg:p-0">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl lg:h-full lg:max-w-none lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-gray-100 lg:p-6 lg:shadow-none dark:bg-gray-900 dark:lg:border-gray-800">
          <div className="mb-4 hidden items-center gap-2 rounded-lg bg-success p-3 text-center text-sm font-semibold text-white lg:flex lg:justify-center">
            {BannerIcon && <BannerIcon className="h-4 w-4 shrink-0" />}
            {bannerText}
            {route.durationText && isOnTrip && ` · ${route.durationText}`}
          </div>

          {(isPickupPhase || isTripPhase) && (
            <div className="mb-3 flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pale text-sm font-bold text-brand dark:bg-brand/15">
                {passengerName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Pasajero</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{passengerName ?? 'Pasajero'}</p>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-start gap-2">
            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {trip?.status === 'in_progress' ? 'DESTINO' : 'ORIGEN'}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-100">
                {trip?.status === 'in_progress'
                  ? (trip?.destinationAddress ?? '—')
                  : (trip?.originAddress ?? '—')}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">TARIFA</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {trip ? `L. ${trip.fare.toFixed(2)} · ${trip.distanceKm.toFixed(1)} km` : '—'}
            </span>
          </div>

          {trip?.status === 'completed' || trip?.status === 'cancelled' ? (
            <button
              type="button"
              onClick={() => navigate('/driver', { replace: true })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Home className="h-4 w-4" /> Volver al inicio
            </button>
          ) : (
            <div className="flex gap-3">
              <a
                href={canCall ? `tel:${trip?.passengerPhone}` : undefined}
                aria-disabled={!canCall}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold ${
                  canCall
                    ? 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
                    : 'pointer-events-none border border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-600'
                }`}
              >
                <Phone className="h-4 w-4" /> Llamar
              </a>

              {trip?.status === 'accepted' && !trip.arrivedAt && (
                <button
                  type="button"
                  onClick={handleMarkArrived}
                  disabled={isUpdatingStatus || !isNearTarget}
                  title={isNearTarget ? undefined : 'Acércate al punto de recogida para habilitar este botón'}
                  className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Llegué
                </button>
              )}

              {trip?.status === 'accepted' && trip.arrivedAt && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isUpdatingStatus}
                  className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Iniciar viaje
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
          )}

          {isPickupPhase && !trip?.arrivedAt && !isNearTarget && (
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              Acércate al punto de recogida para poder marcar tu llegada.
            </p>
          )}

          {isTripPhase && !isNearTarget && (
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">Acércate al destino para poder completar el viaje.</p>
          )}

          {isWaitingForPassenger && (
            <div className="mt-3 text-center">
              {!canReportNoShow ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Esperando al pasajero... podrás reportar que no llegó en {remainingLabel}.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNoShowConfirm(true)}
                  disabled={isReportingNoShow}
                  className="text-xs font-medium text-red-500 underline disabled:opacity-50"
                >
                  El pasajero no llegó
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showNoShowConfirm && (
        <ReportNoShowConfirmModal
          isSubmitting={isReportingNoShow}
          onConfirm={handleReportNoShow}
          onDismiss={() => setShowNoShowConfirm(false)}
        />
      )}
    </div>
  );
}
