import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTheme } from '../hooks/useTheme';
import { boundsWithPadding } from '../utils/geo';

export interface PlaceSelection {
  address: string;
  lat: number;
  lng: number;
}

const LOCATION_RESTRICTION_RADIUS_KM = 50;

function applyElementTheme(element: google.maps.places.PlaceAutocompleteElement, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    element.style.setProperty('color-scheme', 'dark');
    element.style.setProperty('--gmp-mat-color-surface', '#111827');
    element.style.setProperty('--gmp-mat-color-on-surface', '#f3f4f6');
    element.style.setProperty('--gmp-mat-color-on-surface-variant', '#9ca3af');
    element.style.setProperty('--gmp-mat-color-primary', '#e8532e');
    element.style.setProperty('--gmp-mat-color-outline', '#374151');
    return;
  }
  element.style.setProperty('color-scheme', 'light');
  element.style.setProperty('--gmp-mat-color-surface', '#ffffff');
  element.style.setProperty('--gmp-mat-color-on-surface', '#1f2937');
  element.style.setProperty('--gmp-mat-color-on-surface-variant', '#6b7280');
  element.style.setProperty('--gmp-mat-color-primary', '#e8532e');
  element.style.setProperty('--gmp-mat-color-outline', '#e5e7eb');
}

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
  const { theme } = useTheme();
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

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  });

  useEffect(() => {
    if (!placesLibrary || !containerRef.current) return;

    const element = new placesLibrary.PlaceAutocompleteElement({
      includedRegionCodes: ['hn'],
      ...(locationBiasRef.current && {
        locationRestriction: boundsWithPadding([locationBiasRef.current], LOCATION_RESTRICTION_RADIUS_KM),
      }),
    });
    element.id = id;
    if (placeholder) element.placeholder = placeholder;
    element.style.width = '100%';
    applyElementTheme(element, themeRef.current);
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
      elementRef.current.locationRestriction = boundsWithPadding([locationBias], LOCATION_RESTRICTION_RADIUS_KM);
    }
  }, [locationBias]);

  useEffect(() => {
    if (elementRef.current) {
      applyElementTheme(elementRef.current, theme);
    }
  }, [theme]);

  return <div ref={containerRef} className="w-full" />;
}
