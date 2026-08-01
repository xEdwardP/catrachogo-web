import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker, Polyline } from '@vis.gl/react-google-maps';
import { ArrowLeft, Briefcase, Home, Loader2, MapPin, Navigation, Plus, Trash2 } from 'lucide-react';
import { PlacesAutocompleteInput } from '../components/PlacesAutocompleteInput';
import type { PlaceSelection } from '../components/PlacesAutocompleteInput';
import { HeaderActionsPill } from '../components/HeaderActionsPill';
import { MapAutoRecenter } from '../components/MapAutoRecenter';
import { MapResizeObserver } from '../components/MapResizeObserver';
import { SaveFavoriteAddressModal } from '../components/SaveFavoriteAddressModal';
import { createTrip, estimateFare, getTripHistory } from '../api/trips';
import { createSavedAddress, deleteSavedAddress, getSavedAddresses } from '../api/savedAddresses';
import { getApiStatusCode } from '../api/client';
import { translateCreateTripError, translateEstimateError } from '../api/tripErrorMessages';
import { useAuth } from '../hooks/useAuth';
import { useDirectionsRoute } from '../hooks/useDirectionsRoute';
import { useGeolocation } from '../hooks/useGeolocation';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { LocateMeButton } from '../components/LocateMeButton';
import { ROUTE_COLOR } from '../utils/mapColors';
import { boundsWithPadding } from '../utils/geo';
import { savedAddressDisplayLabel } from '../utils/savedAddressLabels';
import type { FareEstimate } from '../types/trip';
import type { CreateSavedAddressPayload, SavedAddress } from '../types/savedAddress';

const SAVED_ADDRESS_ICONS: Record<SavedAddress['label'], typeof Home> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };
const RECENT_DESTINATIONS_LIMIT = 5;
const LOCATE_ZOOM = 16;

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
  const { user } = useAuth();
  const [step, setStep] = useState<'home' | 'confirm'>('home');
  const [origin, setOrigin] = useState<PlaceSelection | null>(null);
  const [originInputValue, setOriginInputValue] = useState('');
  const [destination, setDestination] = useState<PlaceSelection | null>(null);
  const [destinationInputValue, setDestinationInputValue] = useState('');
  const [fare, setFare] = useState<FareEstimate | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [recentDestinations, setRecentDestinations] = useState<PlaceSelection[]>([]);
  const [favorites, setFavorites] = useState<SavedAddress[]>([]);
  const [showSaveFavoriteModal, setShowSaveFavoriteModal] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  useEffect(() => {
    getSavedAddresses()
      .then(setFavorites)
      .catch(() => {});
  }, []);

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

  const { isLoading: isLocating, locate } = useGeolocation();
  const reverseGeocode = useReverseGeocode();
  const [locateFocusKey, setLocateFocusKey] = useState(0);

  const handleLocateMe = useCallback(async () => {
    const position = await locate();
    if (!position) {
      toast.error('No se pudo obtener tu ubicación. Escribe tu punto de partida.');
      return;
    }
    const address = (await reverseGeocode(position.lat, position.lng)) ?? 'Mi ubicación actual';
    setOrigin({ address, lat: position.lat, lng: position.lng });
    setOriginInputValue(address);
    setFare(null);
    setLocateFocusKey((key) => key + 1);
  }, [locate, reverseGeocode]);

  useEffect(() => {
    const id = setTimeout(() => {
      void handleLocateMe();
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
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

  async function handleSaveFavorite(payload: CreateSavedAddressPayload) {
    setIsSavingFavorite(true);
    try {
      const saved = await createSavedAddress(payload);
      setFavorites((current) => [...current, saved]);
      toast.success('Dirección guardada.');
      setShowSaveFavoriteModal(false);
    } catch {
      toast.error('No se pudo guardar la dirección. Intenta de nuevo.');
    } finally {
      setIsSavingFavorite(false);
    }
  }

  async function handleDeleteFavorite(id: string) {
    const previous = favorites;
    setFavorites((current) => current.filter((favorite) => favorite.id !== id));
    try {
      await deleteSavedAddress(id);
    } catch {
      setFavorites(previous);
      toast.error('No se pudo eliminar la dirección. Intenta de nuevo.');
    }
  }

  const recenterTarget = destination ?? origin ?? null;

  const homeRestriction = useMemo(
    () => ({ latLngBounds: boundsWithPadding([origin ?? DEFAULT_CENTER], 20), strictBounds: false }),
    [origin],
  );
  const confirmRestriction = useMemo(
    () => ({
      latLngBounds: boundsWithPadding([origin ?? DEFAULT_CENTER, destination ?? DEFAULT_CENTER], 5),
      strictBounds: false,
    }),
    [origin, destination],
  );

  if (step === 'home') {
    return (
      <div className="min-h-screen bg-cream p-4 lg:p-8">
        <div className="mx-auto max-w-md lg:max-w-5xl">
          <div className="mb-4 flex items-center justify-between lg:mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-pale text-sm font-bold text-brand shadow-sm">
                {user?.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Hola,</p>
                <p className="font-semibold text-gray-800">{firstName}</p>
              </div>
            </div>
            <HeaderActionsPill
              historyPath="/passenger/trips/history"
              walletPath="/passenger/wallet"
              profilePath="/passenger/profile"
            />
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="mb-4 rounded-2xl bg-white p-1 shadow-sm lg:col-span-3">
              <PlacesAutocompleteInput
                id="destination-search"
                placeholder="¿A dónde vas?"
                displayValue={destinationInputValue}
                locationBias={origin ? { lat: origin.lat, lng: origin.lng } : DEFAULT_CENTER}
                onPlaceSelected={selectDestination}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Direcciones favoritas</p>
                  <button
                    type="button"
                    onClick={() => setShowSaveFavoriteModal(true)}
                    className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </button>
                </div>
                {favorites.length > 0 && (
                  <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-2">
                    {favorites.map((favorite) => {
                      const Icon = SAVED_ADDRESS_ICONS[favorite.label];
                      return (
                        <div
                          key={favorite.id}
                          className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 shadow-sm transition hover:bg-cream/70"
                        >
                          <button
                            type="button"
                            onClick={() => selectDestination({ address: favorite.address, lat: favorite.lat, lng: favorite.lng })}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-gray-800">
                                {savedAddressDisplayLabel(favorite)}
                              </span>
                              <span className="block truncate text-xs text-gray-500">{favorite.address}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFavorite(favorite.id)}
                            aria-label="Eliminar dirección favorita"
                            className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {recentDestinations.length > 0 && (
                <div className="mb-4 lg:mb-0">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Destinos recientes</p>
                  <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-2">
                    {recentDestinations.map((place) => (
                      <button
                        key={place.address}
                        type="button"
                        onClick={() => selectDestination(place)}
                        className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm transition hover:bg-cream/70"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{place.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative h-40 overflow-hidden rounded-2xl shadow-sm lg:col-span-1 lg:h-auto lg:min-h-[260px]">
              <GoogleMap
                defaultCenter={DEFAULT_CENTER}
                defaultZoom={14}
                disableDefaultUI
                gestureHandling="greedy"
                restriction={homeRestriction}
                className="h-full w-full"
              >
                <MapAutoRecenter position={origin} zoom={LOCATE_ZOOM} focusKey={locateFocusKey} />
                <MapResizeObserver />
                {origin && <Marker position={origin} />}
              </GoogleMap>
              <LocateMeButton isLoading={isLocating} onClick={handleLocateMe} className="absolute bottom-2 right-2" />
            </div>
          </div>
        </div>

        {showSaveFavoriteModal && (
          <SaveFavoriteAddressModal
            isSubmitting={isSavingFavorite}
            locationBias={origin ? { lat: origin.lat, lng: origin.lng } : DEFAULT_CENTER}
            onSave={handleSaveFavorite}
            onDismiss={() => setShowSaveFavoriteModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative h-full w-full lg:flex-1">
        <GoogleMap
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={14}
          disableDefaultUI
          gestureHandling="greedy"
          restriction={confirmRestriction}
          className="h-full w-full"
        >
          <MapAutoRecenter position={recenterTarget} zoom={LOCATE_ZOOM} focusKey={locateFocusKey} />
          <MapResizeObserver />
          {plannedRoute.path && (
            <Polyline path={plannedRoute.path} strokeColor={ROUTE_COLOR} strokeOpacity={0.9} strokeWeight={4} />
          )}
          {origin && <Marker position={origin} />}
          {destination && <Marker position={destination} />}
        </GoogleMap>
        <LocateMeButton isLoading={isLocating} onClick={handleLocateMe} className="absolute bottom-24 right-4 sm:bottom-4" />

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
          <HeaderActionsPill
            historyPath="/passenger/trips/history"
            walletPath="/passenger/wallet"
            profilePath="/passenger/profile"
            shadow="md"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4 lg:static lg:w-[420px] lg:shrink-0 lg:p-0">
        <div className="w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl lg:h-full lg:max-w-none lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-gray-100 lg:p-6 lg:shadow-none">
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
