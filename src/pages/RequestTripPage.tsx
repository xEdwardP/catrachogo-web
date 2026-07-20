import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Clock, Loader2, LogOut, Navigation, Wallet } from 'lucide-react';
import { PlacesAutocompleteInput } from '../components/PlacesAutocompleteInput';
import type { PlaceSelection } from '../components/PlacesAutocompleteInput';
import { createTrip, estimateFare } from '../api/trips';
import { getApiStatusCode } from '../api/client';
import { translateCreateTripError, translateEstimateError } from '../api/tripErrorMessages';
import { useAuth } from '../hooks/useAuth';
import type { FareEstimate } from '../types/trip';

const DEFAULT_CENTER = { lat: 15.5, lng: -88.03 };

interface FareEstimatePanelProps {
  origin: PlaceSelection;
  destination: PlaceSelection;
  onResult: (result: FareEstimate | null) => void;
}

function FareEstimatePanel({ origin, destination, onResult }: FareEstimatePanelProps) {
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
    <div className="mb-4 flex items-center justify-between rounded-lg bg-[#FDEAE3] px-3 py-2">
      <span className="text-sm text-gray-600">Tarifa estimada</span>
      {status === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#2DBE87]" />
      ) : (
        <span className="text-sm font-bold text-[#2DBE87]">
          L. {status.fare.toFixed(2)} · {status.distanceKm.toFixed(1)} km
        </span>
      )}
    </div>
  );
}

export function RequestTripPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [origin, setOrigin] = useState<PlaceSelection | null>(null);
  const [originInputValue, setOriginInputValue] = useState('');
  const [destination, setDestination] = useState<PlaceSelection | null>(null);
  const [destinationInputValue, setDestinationInputValue] = useState('');
  const [fare, setFare] = useState<FareEstimate | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

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

  const mapCenter = destination ?? origin ?? DEFAULT_CENTER;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <GoogleMap
        center={mapCenter}
        zoom={14}
        onCameraChanged={() => {}}
        disableDefaultUI
        className="h-full w-full"
      >
        {origin && <Marker position={origin} />}
        {destination && <Marker position={destination} />}
      </GoogleMap>

      <div className="absolute inset-x-0 top-0 mx-auto flex w-full max-w-2xl items-start gap-2 p-4">
        <div className="flex-1">
          <PlacesAutocompleteInput
            id="destination-search"
            placeholder="¿A dónde vas?"
            displayValue={destinationInputValue}
            onPlaceSelected={(place) => {
              setDestination(place);
              setDestinationInputValue(place.address);
              setFare(null);
            }}
          />
        </div>
        <div className="flex gap-2 rounded-lg bg-white p-1.5 shadow-md">
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
              onResult={handleFareResult}
            />
          )}

          <button
            type="button"
            disabled={!origin || !destination || !fare || isRequesting}
            onClick={handleRequestTrip}
            className="w-full rounded-lg bg-[#E8532E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d1471f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequesting ? 'Solicitando...' : 'Solicitar viaje'}
          </button>
        </div>
      </div>
    </div>
  );
}
