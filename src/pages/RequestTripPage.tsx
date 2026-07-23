import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker, Polyline } from '@vis.gl/react-google-maps';
import { ArrowLeft, Clock, Loader2, LogOut, MapPin, Navigation, Wallet } from 'lucide-react';
import { PlacesAutocompleteInput } from '../components/PlacesAutocompleteInput';
import type { PlaceSelection } from '../components/PlacesAutocompleteInput';
import { NotificationBell } from '../components/NotificationBell';
import { MapAutoRecenter } from '../components/MapAutoRecenter';
import { createTrip, estimateFare, getTripHistory } from '../api/trips';
import { getApiStatusCode } from '../api/client';
import { translateCreateTripError, translateEstimateError } from '../api/tripErrorMessages';
import { useAuth } from '../hooks/useAuth';
import { useDirectionsRoute } from '../hooks/useDirectionsRoute';
import { ROUTE_COLOR } from '../utils/mapColors';
import type { FareEstimate } from '../types/trip';

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };
const RECENT_DESTINATIONS_LIMIT = 5;

interface FareEstimatePanelProps {
  origin: PlaceSelection;
  destination: PlaceSelection;
  durationText: string | null;
  onResult: (result: FareEstimate | null) => void;
}

function FareEstimatePanel({ origin, destination, durationText, onResult }: FareEstimatePanelProps) {
  const [status, setStatus] = useState<'loading' | 'error' | FareEstimate>('loading');

  useEffect(() => {
    let cancelled = false;
    estimateFare({
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    })
      .then((result) => {
        if (cancelled) return;
        setStatus(result);
        onResult(result);
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        onResult(null);
        toast.error(translateEstimateError(error));
      });
    return () => {
      cancelled = true;
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng, onResult]);

  if (status === 'error') return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-brand-pale px-3 py-2">
      <span className="text-sm text-gray-600">Tarifa estimada</span>
      {status === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin text-success" />
      ) : (
        <span className="text-sm font-bold text-success">
          L. {status.fare.toFixed(2)} · {status.distanceKm.toFixed(1)} km
          {durationText ? ` · ${durationText}` : ''}
        </span>
      )}
    </div>
  );
}

export function RequestTripPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState<'home' | 'confirm'>('home');
  const [origin, setOrigin] = useState<PlaceSelection | null>(null);
  const [originInputValue, setOriginInputValue] = useState('');
  const [destination, setDestination] = useState<PlaceSelection | null>(null);
  const [destinationInputValue, setDestinationInputValue] = useState('');
  const [fare, setFare] = useState<FareEstimate | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [recentDestinations, setRecentDestinations] = useState<PlaceSelection[]>([]);

  useEffect(() => {
    getTripHistory(1, 20)
      .then((result) => {
        const seen = new Set<string>();
        const recents: PlaceSelection[] = [];
        for (const trip of result.data) {
          if (!trip.destinationAddress || trip.destinationLat == null || trip.destinationLng == null) continue;
          if (seen.has(trip.destinationAddress)) continue;
          seen.add(trip.destinationAddress);
          recents.push({ address: trip.destinationAddress, lat: trip.destinationLat, lng: trip.destinationLng });
          if (recents.length >= RECENT_DESTINATIONS_LIMIT) break;
        }
        setRecentDestinations(recents);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          address: 'Mi ubicación actual',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setOriginInputValue('Mi ubicación actual');
        setFare(null);
      },
      () => {
        setOriginInputValue('');
        toast.error('No se pudo obtener tu ubicación. Escribe tu punto de partida.');
      },
    );
  }, []);

  const handleFareResult = useCallback((result: FareEstimate | null) => setFare(result), []);

  const plannedRoute = useDirectionsRoute(origin?.lat, origin?.lng, destination?.lat, destination?.lng);

  function selectDestination(place: PlaceSelection) {
    setDestination(place);
    setDestinationInputValue(place.address);
    setFare(null);
    setStep('confirm');
  }

  const firstName = useMemo(() => user?.name.split(' ')[0], [user?.name]);

  async function handleRequestTrip() {
    if (!origin || !destination) return;
    setIsRequesting(true);
    try {
      const trip = await createTrip({
        originLat: origin.lat,
        originLng: origin.lng,
        originAddress: originInputValue,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        destinationAddress: destinationInputValue,
      });
      navigate(`/passenger/trips/${trip.id}`, {
        state: {
          originAddress: originInputValue,
          destinationAddress: destinationInputValue,
          originLat: origin.lat,
          originLng: origin.lng,
        },
      });
    } catch (error) {
      const statusCode = getApiStatusCode(error);
      toast.error(translateCreateTripError(error), {
        action:
          statusCode === 402
            ? { label: 'Recargar wallet', onClick: () => navigate('/passenger/wallet') }
            : undefined,
      });
    } finally {
      setIsRequesting(false);
    }
  }

  const recenterTarget = destination ?? origin ?? null;

  if (step === 'home') {
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
                <p className="font-semibold text-gray-800">{firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white p-1.5 shadow-sm">
              <NotificationBell />
              <button
                type="button"
                onClick={() => navigate('/passenger/trips/history')}
                aria-label="Historial de viajes"
                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
              >
                <Clock className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/passenger/wallet')}
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

          <div className="mb-4 rounded-2xl bg-white p-1 shadow-sm">
            <PlacesAutocompleteInput
              id="destination-search"
              placeholder="¿A dónde vas?"
              displayValue={destinationInputValue}
              locationBias={origin ? { lat: origin.lat, lng: origin.lng } : DEFAULT_CENTER}
              onPlaceSelected={selectDestination}
            />
          </div>

          {recentDestinations.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Destinos recientes</p>
              <div className="flex flex-col gap-2">
                {recentDestinations.map((place) => (
                  <button
                    key={place.address}
                    type="button"
                    onClick={() => selectDestination(place)}
                    className="flex items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm transition hover:bg-cream/70"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm text-gray-700">{place.address}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative h-40 overflow-hidden rounded-2xl shadow-sm">
            <GoogleMap
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={14}
              disableDefaultUI
              gestureHandling="greedy"
              className="h-full w-full"
            >
              <MapAutoRecenter position={origin} />
              {origin && <Marker position={origin} />}
            </GoogleMap>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <GoogleMap
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={14}
        disableDefaultUI
        gestureHandling="greedy"
        className="h-full w-full"
      >
        <MapAutoRecenter position={recenterTarget} />
        {plannedRoute.path && (
          <Polyline path={plannedRoute.path} strokeColor={ROUTE_COLOR} strokeOpacity={0.9} strokeWeight={4} />
        )}
        {origin && <Marker position={origin} />}
        {destination && <Marker position={destination} />}
      </GoogleMap>

      <div className="absolute inset-x-0 top-0 mx-auto flex w-full max-w-2xl items-start gap-2 p-4">
        <button
          type="button"
          onClick={() => setStep('home')}
          aria-label="Volver al inicio"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 shadow-md hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <PlacesAutocompleteInput
            id="destination-search"
            placeholder="¿A dónde vas?"
            displayValue={destinationInputValue}
            locationBias={origin ? { lat: origin.lat, lng: origin.lng } : DEFAULT_CENTER}
            onPlaceSelected={(place) => {
              setDestination(place);
              setDestinationInputValue(place.address);
              setFare(null);
            }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white p-1.5 shadow-md">
          <NotificationBell />
          <button
            type="button"
            onClick={() => navigate('/passenger/trips/history')}
            aria-label="Historial de viajes"
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
          >
            <Clock className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/passenger/wallet')}
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

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl">
          <div className="mb-3">
            <label htmlFor="origin-input" className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
              <Navigation className="h-3 w-3" /> ORIGEN
            </label>
            <PlacesAutocompleteInput
              id="origin-input"
              placeholder="Punto de partida"
              displayValue={originInputValue}
              locationBias={origin ? { lat: origin.lat, lng: origin.lng } : DEFAULT_CENTER}
              onPlaceSelected={(place) => {
                setOrigin(place);
                setOriginInputValue(place.address);
                setFare(null);
              }}
            />
          </div>

          <div className="mb-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">DESTINO</p>
            <p className="text-sm text-gray-800">{destinationInputValue || 'Selecciona un destino'}</p>
          </div>

          {origin && destination && (
            <FareEstimatePanel
              key={`${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`}
              origin={origin}
              destination={destination}
              durationText={plannedRoute.durationText}
              onResult={handleFareResult}
            />
          )}

          <button
            type="button"
            disabled={!origin || !destination || !fare || isRequesting}
            onClick={handleRequestTrip}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequesting ? 'Solicitando...' : 'Solicitar viaje'}
          </button>
        </div>
      </div>
    </div>
  );
}
