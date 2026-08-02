import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, LocateFixed, X } from 'lucide-react';
import { PlacesAutocompleteInput } from './PlacesAutocompleteInput';
import type { PlaceSelection } from './PlacesAutocompleteInput';
import { useGeolocation } from '../hooks/useGeolocation';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { SAVED_ADDRESS_LABELS } from '../utils/savedAddressLabels';
import type { CreateSavedAddressPayload, SavedAddressLabel } from '../types/savedAddress';

const LABEL_OPTIONS: SavedAddressLabel[] = ['home', 'work', 'other'];

interface SaveFavoriteAddressModalProps {
  isSubmitting: boolean;
  locationBias?: { lat: number; lng: number } | null;
  onSave: (payload: CreateSavedAddressPayload) => void;
  onDismiss: () => void;
}

export function SaveFavoriteAddressModal({
  isSubmitting,
  locationBias,
  onSave,
  onDismiss,
}: SaveFavoriteAddressModalProps) {
  const [place, setPlace] = useState<PlaceSelection | null>(null);
  const [label, setLabel] = useState<SavedAddressLabel>('home');
  const [customLabel, setCustomLabel] = useState('');

  const { isLoading: isLocating, locate } = useGeolocation();
  const reverseGeocode = useReverseGeocode();

  const canSave = Boolean(place) && (label !== 'other' || customLabel.trim().length > 0);

  async function handleUseCurrentLocation() {
    const here = await locate();
    if (!here) {
      toast.error('No se pudo obtener tu ubicación.');
      return;
    }
    const address = (await reverseGeocode(here.lat, here.lng)) ?? 'Mi ubicación actual';
    setPlace({ address, lat: here.lat, lng: here.lng });
    setLabel('other');
  }

  function handleSave() {
    if (!place || !canSave) return;
    onSave({
      label,
      customLabel: label === 'other' ? customLabel.trim() : undefined,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
    });
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="float-right text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-gray-800">Guardar dirección favorita</h2>

        <div className="mb-4">
          <label htmlFor="favorite-address" className="mb-1 block text-xs font-semibold text-gray-500">
            DIRECCIÓN
          </label>
          <div className="rounded-lg border border-gray-300 p-1">
            <PlacesAutocompleteInput
              id="favorite-address"
              placeholder="Busca una dirección"
              displayValue={place?.address ?? ''}
              locationBias={locationBias}
              onPlaceSelected={setPlace}
            />
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
            Usar mi ubicación actual
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold text-gray-500">ETIQUETA</p>
        <div className="mb-4 flex flex-col gap-2">
          {LABEL_OPTIONS.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 has-[:checked]:border-brand has-[:checked]:bg-brand-pale"
            >
              <input
                type="radio"
                name="favorite-label"
                value={value}
                checked={label === value}
                onChange={() => setLabel(value)}
                className="accent-brand"
              />
              {SAVED_ADDRESS_LABELS[value]}
            </label>
          ))}
        </div>

        {label === 'other' && (
          <div className="mb-5">
            <label htmlFor="favorite-custom-label" className="mb-1 block text-xs font-semibold text-gray-500">
              NOMBRE
            </label>
            <input
              id="favorite-custom-label"
              type="text"
              value={customLabel}
              onChange={(event) => setCustomLabel(event.target.value)}
              placeholder="Ej. Gimnasio"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSubmitting}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
