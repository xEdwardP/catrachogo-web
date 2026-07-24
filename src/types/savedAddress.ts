export type SavedAddressLabel = 'home' | 'work' | 'other';

export interface SavedAddress {
  id: string;
  label: SavedAddressLabel;
  customLabel: string | null;
  address: string;
  lat: number;
  lng: number;
}

export interface CreateSavedAddressPayload {
  label: SavedAddressLabel;
  customLabel?: string;
  address: string;
  lat: number;
  lng: number;
}
