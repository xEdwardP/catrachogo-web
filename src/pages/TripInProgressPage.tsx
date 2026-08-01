import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker, Polyline } from '@vis.gl/react-google-maps';
import { Flag, Phone, ShieldAlert, Star, X } from 'lucide-react';
import { cancelTrip, endTripEarly, getDriverLocation, getTripDetail } from '../api/trips';
import { getDriverPublicProfile } from '../api/drivers';
import { createIncidentReport } from '../api/incidentReports';
import { translateCreateIncidentReportError } from '../api/incidentReportErrorMessages';
import { translateCancelTripError, translateEndTripEarlyError } from '../api/tripErrorMessages';
import { usePolling } from '../hooks/usePolling';
import { useSmoothedPosition } from '../hooks/useSmoothedPosition';
import { useDirectionsRoute } from '../hooks/useDirectionsRoute';
import { ROUTE_COLOR } from '../utils/mapColors';
import { boundsWithPadding, isPlausibleMovement } from '../utils/geo';
import { RatingModal } from '../components/RatingModal';
import { CancelTripConfirmModal } from '../components/CancelTripConfirmModal';
import { EndTripEarlyConfirmModal } from '../components/EndTripEarlyConfirmModal';
import { ReportIncidentModal } from '../components/ReportIncidentModal';
import { MapAutoRecenter } from '../components/MapAutoRecenter';
import { MapResizeObserver } from '../components/MapResizeObserver';
import type { CancellationReason, TripDetail, TripDriverInfo, TripStatus } from '../types/trip';
import type { IncidentReportCategory } from '../types/incidentReport';

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEndingEarly, setIsEndingEarly] = useState(false);
  const [showEndEarlyConfirm, setShowEndEarlyConfirm] = useState(false);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const fetchedDriverIdRef = useRef<string | null>(null);
  const lastDriverPositionRef = useRef<{ lat: number; lng: number; timestampMs: number } | null>(null);

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
          if (!loc) return;
          const next = { lat: loc.lat, lng: loc.lng, timestampMs: Date.now() };
          const last = lastDriverPositionRef.current;
          if (last && !isPlausibleMovement(last, next)) return;
          lastDriverPositionRef.current = next;
          setDriverPosition({ lat: loc.lat, lng: loc.lng });
        })
        .catch(() => {});
    },
    4000,
    Boolean(tripId) && isTrackable,
  );

  async function handleCancel(reason: CancellationReason) {
    if (!tripId) return;
    setIsCancelling(true);
    try {
      const cancelled = await cancelTrip(tripId, reason);
      toast.success(
        cancelled.cancellationFee
          ? `Viaje cancelado. Se aplicó un cargo de L. ${cancelled.cancellationFee.toFixed(2)}.`
          : 'Viaje cancelado.',
      );
      navigate('/passenger');
    } catch (error) {
      toast.error(translateCancelTripError(error));
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  }

  function handleCancelClick() {
    setShowCancelConfirm(true);
  }

  async function handleEndTripEarly() {
    if (!tripId) return;
    setIsEndingEarly(true);
    try {
      const ended = await endTripEarly(tripId);
      toast.success(`Viaje finalizado. Se cobró L. ${ended.fare.toFixed(2)} por la distancia recorrida.`);
      navigate('/passenger');
    } catch (error) {
      toast.error(translateEndTripEarlyError(error));
    } finally {
      setIsEndingEarly(false);
      setShowEndEarlyConfirm(false);
    }
  }

  async function handleSubmitReport(payload: { category: IncidentReportCategory; description: string }) {
    if (!tripId) return;
    setIsSubmittingReport(true);
    try {
      await createIncidentReport({ tripId, ...payload });
      toast.success('Reporte enviado. Gracias por avisarnos.');
      setShowReportModal(false);
    } catch (error) {
      toast.error(translateCreateIncidentReportError(error));
    } finally {
      setIsSubmittingReport(false);
    }
  }

  const smoothedDriverPosition = useSmoothedPosition(driverPosition, 3500);

  const isHeadingToPickup = trip?.status === 'accepted';
  const routeDestinationLat = isHeadingToPickup ? trip?.originLat : trip?.destinationLat;
  const routeDestinationLng = isHeadingToPickup ? trip?.originLng : trip?.destinationLng;
  const route = useDirectionsRoute(
    driverPosition?.lat,
    driverPosition?.lng,
    isTrackable ? routeDestinationLat : undefined,
    isTrackable ? routeDestinationLng : undefined,
  );

  const zonePoints: { lat: number; lng: number }[] = [];
  if (trip?.originLat != null && trip?.originLng != null) {
    zonePoints.push({ lat: trip.originLat, lng: trip.originLng });
  }
  if (trip?.destinationLat != null && trip?.destinationLng != null) {
    zonePoints.push({ lat: trip.destinationLat, lng: trip.destinationLng });
  }
  if (zonePoints.length === 0 && state?.originLat !== undefined && state?.originLng !== undefined) {
    zonePoints.push({ lat: state.originLat, lng: state.originLng });
  }
  if (zonePoints.length === 0) zonePoints.push(DEFAULT_CENTER);
  const zoneRestriction = { latLngBounds: boundsWithPadding(zonePoints, 5), strictBounds: false };

  if (!tripId) {
    return null;
  }

  const bannerText = trip
    ? trip.status === 'accepted' && trip.arrivedAt
      ? 'Tu conductor ha llegado'
      : STATUS_BANNER[trip.status]
    : 'Cargando...';
  const canCall = Boolean(trip?.driverPhone);
  const destinationAddress = trip?.destinationAddress ?? state?.destinationAddress ?? '';
  const fallbackCenter =
    state?.originLat !== undefined && state?.originLng !== undefined
      ? { lat: state.originLat, lng: state.originLng }
      : DEFAULT_CENTER;
  const canCancel = trip?.status === 'pending' || trip?.status === 'accepted';
  const shouldShowRating =
    !ratingDismissed && trip?.status === 'completed' && Boolean(driver?.userId) && trip?.ratedByMe === false;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative h-full w-full lg:flex-1">
        <div
          className={`absolute inset-x-0 top-0 z-10 p-3 text-center text-sm font-semibold text-white lg:hidden ${
            trip?.status === 'cancelled' ? 'bg-gray-500' : 'bg-success'
          }`}
        >
          {bannerText}
          {route.durationText && isTrackable && ` · llega en ${route.durationText}`}
        </div>

        <GoogleMap
          defaultCenter={fallbackCenter}
          defaultZoom={14}
          disableDefaultUI
          gestureHandling="greedy"
          restriction={zoneRestriction}
          className="h-full w-full"
        >
          <MapAutoRecenter position={smoothedDriverPosition} />
          <MapResizeObserver />
          {route.path && (
            <Polyline path={route.path} strokeColor={ROUTE_COLOR} strokeOpacity={0.9} strokeWeight={4} />
          )}
          {smoothedDriverPosition && <Marker position={smoothedDriverPosition} />}
        </GoogleMap>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4 lg:static lg:w-[420px] lg:shrink-0 lg:p-0">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl lg:h-full lg:max-w-none lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-gray-100 lg:p-6 lg:shadow-none">
          <div
            className={`mb-4 hidden rounded-lg p-3 text-center text-sm font-semibold text-white lg:block ${
              trip?.status === 'cancelled' ? 'bg-gray-500' : 'bg-success'
            }`}
          >
            {bannerText}
            {route.durationText && isTrackable && ` · llega en ${route.durationText}`}
          </div>

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
            {trip?.status === 'in_progress' ? (
              <button
                type="button"
                onClick={() => setShowEndEarlyConfirm(true)}
                disabled={isEndingEarly}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag className="h-4 w-4" /> Finalizar viaje
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={isCancelling || !canCancel}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            )}
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

          {driver && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Reportar un problema
            </button>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <CancelTripConfirmModal
          isSubmitting={isCancelling}
          chargesFee={trip?.status === 'accepted'}
          onConfirm={handleCancel}
          onDismiss={() => setShowCancelConfirm(false)}
        />
      )}

      {showEndEarlyConfirm && (
        <EndTripEarlyConfirmModal
          isSubmitting={isEndingEarly}
          onConfirm={handleEndTripEarly}
          onDismiss={() => setShowEndEarlyConfirm(false)}
        />
      )}

      {showReportModal && (
        <ReportIncidentModal
          isSubmitting={isSubmittingReport}
          onSubmit={handleSubmitReport}
          onDismiss={() => setShowReportModal(false)}
        />
      )}

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
