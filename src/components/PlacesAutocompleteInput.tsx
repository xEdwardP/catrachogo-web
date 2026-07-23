import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface PlaceSelection {
  address: string;
  lat: number;
  lng: number;
}

const LOCATION_BIAS_RADIUS_METERS = 50000;

interface PlacesAutocompleteInputProps {
  id: string;
  placeholder?: string;
  displayValue?: string;
  locationBias?: { lat: number; lng: number } | null;
  onPlaceSelected: (place: PlaceSelection) => void;
}

export function PlacesAutocompleteInput({
  id,
  placeholder,
  displayValue,
  locationBias,
  onPlaceSelected,
}: PlacesAutocompleteInputProps) {
  const placesLibrary = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  });

  const displayValueRef = useRef(displayValue);
  useEffect(() => {
    displayValueRef.current = displayValue;
  });

  const locationBiasRef = useRef(locationBias);
  useEffect(() => {
    locationBiasRef.current = locationBias;
  });

  useEffect(() => {
    if (!placesLibrary || !containerRef.current) return;

    const element = new placesLibrary.PlaceAutocompleteElement({
      includedRegionCodes: ['hn'],
      ...(locationBiasRef.current && {
        locationBias: {
          center: locationBiasRef.current,
          radius: LOCATION_BIAS_RADIUS_METERS,
        },
      }),
    });
    element.id = id;
    if (placeholder) element.placeholder = placeholder;
    element.style.width = '100%';
    if (displayValueRef.current !== undefined) {
      element.value = displayValueRef.current;
    }
    containerRef.current.appendChild(element);
    elementRef.current = element;

    const controller = new AbortController();
    element.addEventListener(
      'gmp-select',
      async (event) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ['formattedAddress', 'location'] });
        if (place.formattedAddress && place.location) {
          onPlaceSelectedRef.current({
            address: place.formattedAddress,
            lat: place.location.lat(),
            lng: place.location.lng(),
          });
        }
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
      element.remove();
      elementRef.current = null;
    };
  }, [placesLibrary, id, placeholder]);

  useEffect(() => {
    if (elementRef.current && displayValue !== undefined) {
      elementRef.current.value = displayValue;
    }
  }, [displayValue]);

  useEffect(() => {
    if (elementRef.current && locationBias) {
      elementRef.current.locationBias = {
        center: locationBias,
        radius: LOCATION_BIAS_RADIUS_METERS,
      };
    }
  }, [locationBias]);

  return <div ref={containerRef} className="w-full" />;
}
